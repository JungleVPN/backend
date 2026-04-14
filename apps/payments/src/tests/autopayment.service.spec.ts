import 'reflect-metadata';
import * as process from 'node:process';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { AutopaymentService } from '@payments/autopayment/autopayment.service';
import { BotNotificationService } from '@payments/notifications/bot-notification.service';
import type { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import type { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { RemnawebhookPayload, WebhookEventEnum } from '@workspace/types';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  let botNotificationService: BotNotificationService;

  let mockSmFindOneBy: ReturnType<typeof vi.fn>;
  let mockYkCreate: ReturnType<typeof vi.fn>;
  let mockYkSave: ReturnType<typeof vi.fn>;
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockEmit: ReturnType<typeof vi.fn>;
  let mockPaymentNotify: ReturnType<typeof vi.fn>;
  let mockSmSave: any;

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

    mockSmSave = vi.fn(async (v: any) => v);

    mockYkCreate = vi.fn((data: any) => data);
    mockYkSave = vi.fn(async (v: any) => v);
    yookassaPaymentRepo = {
      create: mockYkCreate,
      save: mockYkSave,
    } as unknown as Repository<YookassaPayment>;

    mockCreate = vi.fn();
    yookassaProvider = {
      create: mockCreate,
    } as unknown as YooKassaProvider;

    mockEmit = vi.fn();
    eventEmitter = { emit: mockEmit } as unknown as EventEmitter2;

    mockPaymentNotify = vi.fn();
    botNotificationService = {
      notify: mockPaymentNotify,
    } as unknown as BotNotificationService;

    service = new AutopaymentService(
      savedMethodRepo,
      yookassaPaymentRepo,
      yookassaProvider,
      eventEmitter,
      botNotificationService,
    );

    // Stub delay to make tests fast
    vi.spyOn(service as any, 'delay').mockResolvedValue(undefined);
  });

  // ── Entry point: init ────────────────────────────

  describe('init', () => {
    it('skips when payload has no telegramId', async () => {
      await service.init(makePayload(undefined));

      expect(mockSmFindOneBy).not.toHaveBeenCalled();
      expect(mockPaymentNotify).not.toHaveBeenCalled();
    });

    it('notifies bot for manual payment when no saved method exists', async () => {
      mockSmFindOneBy.mockResolvedValue(null);

      await service.init(makePayload(42));

      expect(mockSmFindOneBy).toHaveBeenCalledWith({
        userId: '42',
        isActive: true,
      });
      expect(mockCreate).not.toHaveBeenCalled();
      expect(mockPaymentNotify).toHaveBeenCalledWith(
        'payment.no_active_method',
        expect.objectContaining({
          telegramId: 42,
          provider: 'yookassa',
          reason: 'no_active_method',
        }),
      );
    });

    it('attempts autopayment when saved method exists', async () => {
      mockSmFindOneBy.mockResolvedValue({
        userId: '42',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
      mockCreate.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      await service.init(makePayload(42));

      expect(mockCreate).toHaveBeenCalledTimes(1);
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
      mockCreate.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      await service.init(makePayload(42));

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockPaymentNotify).not.toHaveBeenCalled();
    });

    it('retries up to 3 times on canceled status, then notifies bot', async () => {
      mockCreate.mockResolvedValue({
        id: 'pay_x',
        status: 'canceled',
        cancellation_details: { reason: 'insufficient_funds', party: 'payment_network' },
      });

      await service.init(makePayload(42));

      expect(mockCreate).toHaveBeenCalledTimes(3);
      // Each failed attempt emits AUTOPAYMENT_FAILED
      expect(mockEmit).toHaveBeenCalledTimes(3);
      expect(mockEmit).toHaveBeenCalledWith(
        WebhookEventEnum['payment.autopayment_failed'],
        expect.objectContaining({ telegramId: 42, reason: 'insufficient_funds' }),
      );
      // Final bot notification
      expect(mockPaymentNotify).toHaveBeenCalledWith(
        'payment.autopayment_exhausted',
        expect.objectContaining({ telegramId: 42, provider: 'yookassa' }),
      );
    });

    it('retries up to 3 times on network error, then notifies bot', async () => {
      mockCreate.mockRejectedValue(new Error('network timeout'));

      await service.init(makePayload(42));

      expect(mockCreate).toHaveBeenCalledTimes(3);
      expect(mockPaymentNotify).toHaveBeenCalledWith(
        'payment.autopayment_exhausted',
        expect.objectContaining({ telegramId: 42, provider: 'yookassa' }),
      );
    });

    it('succeeds on second attempt after first failure', async () => {
      mockCreate
        .mockResolvedValueOnce({
          id: 'pay_fail',
          status: 'canceled',
          cancellation_details: { reason: 'temporary_error', party: 'yoo_kassa' },
        })
        .mockResolvedValueOnce({
          id: 'pay_ok',
          status: 'succeeded',
        });

      await service.init(makePayload(42));

      expect(mockCreate).toHaveBeenCalledTimes(2);
      // Only 1 AUTOPAYMENT_FAILED event (from first attempt)
      expect(mockEmit).toHaveBeenCalledTimes(1);
      // No bot manual payment notification
      expect(mockPaymentNotify).not.toHaveBeenCalled();
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
      mockCreate.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      await service.init(makePayload(42));

      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_1',
          status: 'succeeded',
          amount: 200,
          userId: '42',
          description: 'Test payment',
          paidAt: expect.any(Date),
          metadata: expect.objectContaining({
            selectedPeriod: 1,
            telegramId: '42',
          }),
        }),
      );
      expect(mockYkSave).toHaveBeenCalled();
    });

    it('persists record with null paidAt on cancellation', async () => {
      mockCreate.mockResolvedValue({
        id: 'pay_c',
        status: 'canceled',
        cancellation_details: { reason: 'insufficient_funds', party: 'payment_network' },
      });
      mockAxiosPost.mockResolvedValue({ status: 200 });

      await service.init(makePayload(42));

      // 3 attempts = 3 records saved
      expect(mockYkSave).toHaveBeenCalledTimes(3);
      expect(mockYkCreate).toHaveBeenCalledWith(expect.objectContaining({ paidAt: null }));
    });
  });

  // ── Bot notification ───────────────────────────────────────────────

  describe('bot notification', () => {
    it('delegates to BotNotificationService with the correct event + payload when no saved method', async () => {
      mockSmFindOneBy.mockResolvedValue(null);

      await service.init(makePayload(42));

      expect(mockPaymentNotify).toHaveBeenCalledWith('payment.no_active_method', {
        telegramId: 42,
        provider: 'yookassa',
        reason: 'no_active_method',
      });
    });
  });
});
