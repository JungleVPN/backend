import 'reflect-metadata';
import * as process from 'node:process';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { AutopaymentService } from '@payments/autopayment/autopayment.service';
import type { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import type { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import type { RemnawebhookPayload } from '@workspace/types';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PAYMENT_EVENTS } from '../notifications/payment-events';

vi.mock('@workspace/database', () => ({
  SavedPaymentMethod: class {},
  YookassaPayment: class {},
}));

const mockAxiosPost = vi.fn();
vi.mock('axios', () => ({
  default: { post: (...args: any[]) => mockAxiosPost(...args) },
}));

// ── Helpers ──────────────────────────────────────────────────────────

const makePayload = (telegramId?: number | null) =>
  ({
    scope: 'user',
    event: 'user.expires_in_24_hours',
    data: {
      uuid: 'u-1',
      username: 'test',
      status: 'ACTIVE',
      telegramId: telegramId === undefined ? null : telegramId,
    },
    timestamp: new Date(),
    meta: null,
  }) as unknown as RemnawebhookPayload;

describe('AutopaymentService', () => {
  let service: AutopaymentService;

  let savedMethodRepo: Repository<SavedPaymentMethod>;
  let yookassaPaymentRepo: Repository<YookassaPayment>;
  let yookassaProvider: YooKassaProvider;
  let eventEmitter: EventEmitter2;

  let mockSmFindOneBy: ReturnType<typeof vi.fn>;
  let mockYkCreate: ReturnType<typeof vi.fn>;
  let mockYkSave: ReturnType<typeof vi.fn>;
  let mockCreateAutopayment: ReturnType<typeof vi.fn>;
  let mockEmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    process.env.AUTOPAYMENT_AMOUNT = '200';
    process.env.AUTOPAYMENT_PERIOD = '1';
    process.env.BOT_URL = 'http://bot:7080';
    process.env.BOT_NOTIFY_SECRET = 'secret';
    process.env.PAYMENT_DESCRIPTION = 'Test payment';

    mockSmFindOneBy = vi.fn();
    savedMethodRepo = {
      findOneBy: mockSmFindOneBy,
    } as unknown as Repository<SavedPaymentMethod>;

    mockYkCreate = vi.fn((data: any) => data);
    mockYkSave = vi.fn(async (v: any) => v);
    yookassaPaymentRepo = {
      create: mockYkCreate,
      save: mockYkSave,
    } as unknown as Repository<YookassaPayment>;

    mockCreateAutopayment = vi.fn();
    yookassaProvider = {
      createAutopayment: mockCreateAutopayment,
    } as unknown as YooKassaProvider;

    mockEmit = vi.fn();
    eventEmitter = { emit: mockEmit } as unknown as EventEmitter2;

    service = new AutopaymentService(
      savedMethodRepo,
      yookassaPaymentRepo,
      yookassaProvider,
      eventEmitter,
    );

    // Stub delay to make tests fast
    vi.spyOn(service as any, 'delay').mockResolvedValue(undefined);
  });

  // ── Entry point: handleUserExpiresIn24h ────────────────────────────

  describe('handleUserExpiresIn24h', () => {
    it('skips when payload has no telegramId', async () => {
      await service.handleUserExpiresIn24h(makePayload(undefined));

      expect(mockSmFindOneBy).not.toHaveBeenCalled();
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('notifies bot for manual payment when no saved method exists', async () => {
      mockSmFindOneBy.mockResolvedValue(null);
      mockAxiosPost.mockResolvedValue({ status: 200 });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockSmFindOneBy).toHaveBeenCalledWith({
        userId: '42',
        isActive: true,
      });
      expect(mockCreateAutopayment).not.toHaveBeenCalled();
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://bot:7080/notify/payment',
        expect.objectContaining({
          event: 'payment.autopayment_exhausted',
          telegramId: 42,
        }),
        expect.any(Object),
      );
    });

    it('attempts autopayment when saved method exists', async () => {
      mockSmFindOneBy.mockResolvedValue({
        userId: '42',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockCreateAutopayment).toHaveBeenCalledTimes(1);
    });
  });

  // ── Retry logic ────────────────────────────────────────────────────

  describe('retry logic', () => {
    beforeEach(() => {
      mockSmFindOneBy.mockResolvedValue({
        userId: '42',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
    });

    it('stops on first success — no retries', async () => {
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockCreateAutopayment).toHaveBeenCalledTimes(1);
      expect(mockAxiosPost).not.toHaveBeenCalled(); // no bot notification
    });

    it('retries up to 3 times on canceled status, then notifies bot', async () => {
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_x',
        status: 'canceled',
        cancellation_details: { reason: 'insufficient_funds', party: 'payment_network' },
      });
      mockAxiosPost.mockResolvedValue({ status: 200 });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockCreateAutopayment).toHaveBeenCalledTimes(3);
      // Each failed attempt emits AUTOPAYMENT_FAILED
      expect(mockEmit).toHaveBeenCalledTimes(3);
      expect(mockEmit).toHaveBeenCalledWith(
        PAYMENT_EVENTS.AUTOPAYMENT_FAILED,
        expect.objectContaining({ telegramId: 42, reason: 'insufficient_funds' }),
      );
      // Final bot notification
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://bot:7080/notify/payment',
        expect.objectContaining({ event: 'payment.autopayment_exhausted' }),
        expect.any(Object),
      );
    });

    it('retries up to 3 times on network error, then notifies bot', async () => {
      mockCreateAutopayment.mockRejectedValue(new Error('network timeout'));
      mockAxiosPost.mockResolvedValue({ status: 200 });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockCreateAutopayment).toHaveBeenCalledTimes(3);
      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://bot:7080/notify/payment',
        expect.objectContaining({ event: 'payment.autopayment_exhausted' }),
        expect.any(Object),
      );
    });

    it('succeeds on second attempt after first failure', async () => {
      mockCreateAutopayment
        .mockResolvedValueOnce({
          id: 'pay_fail',
          status: 'canceled',
          cancellation_details: { reason: 'temporary_error', party: 'yoo_kassa' },
        })
        .mockResolvedValueOnce({
          id: 'pay_ok',
          status: 'succeeded',
        });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockCreateAutopayment).toHaveBeenCalledTimes(2);
      // Only 1 AUTOPAYMENT_FAILED event (from first attempt)
      expect(mockEmit).toHaveBeenCalledTimes(1);
      // No bot manual payment notification
      expect(mockAxiosPost).not.toHaveBeenCalled();
    });
  });

  // ── Payment record persistence ─────────────────────────────────────

  describe('payment record persistence', () => {
    beforeEach(() => {
      mockSmFindOneBy.mockResolvedValue({
        userId: '42',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
    });

    it('persists record with paidAt on success', async () => {
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_1',
          status: 'succeeded',
          amount: 200,
          userId: '42',
          paidAt: expect.any(Date),
          metadata: expect.objectContaining({ isAutopayment: true }),
        }),
      );
      expect(mockYkSave).toHaveBeenCalled();
    });

    it('persists record with null paidAt on cancellation', async () => {
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_c',
        status: 'canceled',
        cancellation_details: { reason: 'insufficient_funds', party: 'payment_network' },
      });
      mockAxiosPost.mockResolvedValue({ status: 200 });

      await service.handleUserExpiresIn24h(makePayload(42));

      // 3 attempts = 3 records saved
      expect(mockYkSave).toHaveBeenCalledTimes(3);
      expect(mockYkCreate).toHaveBeenCalledWith(expect.objectContaining({ paidAt: null }));
    });
  });

  // ── Bot notification ───────────────────────────────────────────────

  describe('bot notification', () => {
    it('sends correct headers and payload', async () => {
      mockSmFindOneBy.mockResolvedValue(null);
      mockAxiosPost.mockResolvedValue({ status: 200 });

      await service.handleUserExpiresIn24h(makePayload(42));

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://bot:7080/notify/payment',
        {
          event: 'payment.autopayment_exhausted',
          telegramId: 42,
          provider: 'yookassa',
          selectedPeriod: 1,
        },
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-bot-secret': 'secret',
          }),
          timeout: 5_000,
        }),
      );
    });

    it('does not throw when bot notification fails', async () => {
      mockSmFindOneBy.mockResolvedValue(null);
      mockAxiosPost.mockRejectedValue(new Error('bot down'));

      // Should not throw
      await expect(service.handleUserExpiresIn24h(makePayload(42))).resolves.toBeUndefined();
    });
  });
});
