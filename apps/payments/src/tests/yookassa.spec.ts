import 'reflect-metadata';
import * as process from 'node:process';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { AutopaymentService } from '@payments/autopayment/autopayment.service';
import type { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { YookassaService } from '@payments/providers/yookassa/yookassa.service';
import type { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { PaymentWebhookNotification, WebhookEventEnum } from '@workspace/types';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PaymentStatusService } from '../payment-status/payment-status.service';

vi.mock('@workspace/database', () => {
  return {
    YookassaPayment: class {},
    SavedPaymentMethod: class {},
  };
});

// Cast via `unknown` because the fixture uses plain string literals
// instead of PaymentMethodsEnum / BankCardTypeEnum — matches real webhook JSON.
const makeSucceededPayload = (overrides: Partial<any> = {}): PaymentWebhookNotification =>
  ({
    type: 'notification' as const,
    event: 'payment.succeeded' as const,
    object: {
      id: 'pay_1',
      status: 'succeeded' as const,
      paid: true,
      amount: { value: '100', currency: 'RUB' },
      metadata: { telegramId: 42, selectedPeriod: 1 },
      payment_method: {
        type: 'bank_card',
        id: 'pm_1',
        saved: true,
        title: 'Visa 1234',
        card: {
          last4: '1234',
          first6: '400000',
          expiry_month: '12',
          expiry_year: '2030',
          card_type: 'Visa',
          issuer_country: 'RU',
        },
      },
      created_at: '2026-01-01T00:00:00Z',
      refundable: true,
      test: false,
      ...overrides,
    },
  }) as unknown as PaymentWebhookNotification;

describe('YookassaService', () => {
  let service: YookassaService;

  let yookassaPaymentRepo: Repository<YookassaPayment>;
  let savedMethodRepo: Repository<SavedPaymentMethod>;
  let yooKassaProvider: YooKassaProvider;
  let paymentStatusService: PaymentStatusService;
  let eventEmitter: EventEmitter2;
  let autopaymentService: AutopaymentService;

  let mockYkUpdate: any;

  let mockSmFindOneBy: any;
  let mockSmCreate: any;
  let mockSmSave: any;
  let mockSmCount: any;

  let mockHandlePaymentSucceeded: any;
  let mockGetPayment: any;
  let mockEmit: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'test';

    mockYkUpdate = vi.fn();
    yookassaPaymentRepo = {
      update: mockYkUpdate,
    } as unknown as Repository<YookassaPayment>;

    mockSmFindOneBy = vi.fn();
    mockSmCreate = vi.fn((data: any) => data);
    mockSmSave = vi.fn(async (v: any) => v);
    mockSmCount = vi.fn();
    savedMethodRepo = {
      findOneBy: mockSmFindOneBy,
      create: mockSmCreate,
      save: mockSmSave,
      count: mockSmCount,
    } as unknown as Repository<SavedPaymentMethod>;

    mockGetPayment = vi.fn();
    yooKassaProvider = {
      getPayment: mockGetPayment,
    } as unknown as YooKassaProvider;

    mockHandlePaymentSucceeded = vi.fn().mockResolvedValue({ success: true });
    paymentStatusService = {
      handlePaymentSucceeded: mockHandlePaymentSucceeded,
    } as unknown as PaymentStatusService;

    mockEmit = vi.fn();
    eventEmitter = {
      emit: mockEmit,
    } as unknown as EventEmitter2;

    autopaymentService = {
      disableActiveMethodIfExists: vi.fn(),
    } as unknown as AutopaymentService;

    service = new YookassaService(
      yooKassaProvider,
      yookassaPaymentRepo,
      savedMethodRepo,
      paymentStatusService,
      eventEmitter,
      autopaymentService,
    );
  });

  // ─────────────────────────────────────────────────────────
  // handleWebhook
  // ─────────────────────────────────────────────────────────
  describe('handleWebhook', () => {
    it('processes payment.succeeded in non-prod (no IP/API validation)', async () => {
      mockSmCount.mockResolvedValue(0); // new user, not opted out
      mockSmFindOneBy.mockResolvedValue(null); // no existing record

      const payload = makeSucceededPayload();
      await service.handleWebhook(payload, '127.0.0.1');

      expect(mockYkUpdate).toHaveBeenCalledWith(
        'pay_1',
        expect.objectContaining({
          status: 'succeeded',
          url: null,
          paidAt: expect.any(Date),
        }),
      );
      expect(mockHandlePaymentSucceeded).toHaveBeenCalledWith(42, 1);
      expect(mockEmit).toHaveBeenCalledWith(
        WebhookEventEnum['payment.succeeded'],
        expect.objectContaining({ telegramId: 42, provider: 'yookassa', selectedPeriod: 1 }),
      );
    });

    it('ignores non-succeeded events', async () => {
      const payload: any = {
        type: 'notification',
        event: 'payment.canceled',
        object: { id: 'pay_x', metadata: {} },
      };

      await service.handleWebhook(payload, '127.0.0.1');

      expect(mockYkUpdate).not.toHaveBeenCalled();
      expect(mockHandlePaymentSucceeded).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
    });

    it('does NOT emit SUCCEEDED when paymentStatusService returns { success: false }', async () => {
      mockSmCount.mockResolvedValue(0);
      mockSmFindOneBy.mockResolvedValue(null);
      mockHandlePaymentSucceeded.mockResolvedValue({ success: false });

      await service.handleWebhook(makeSucceededPayload(), '127.0.0.1');

      expect(mockYkUpdate).toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalledWith(
        WebhookEventEnum['payment.succeeded'],
        expect.anything(),
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // trySavePaymentMethod (exercised via handleWebhook)
  // ─────────────────────────────────────────────────────────
  describe('save payment method flow', () => {
    it('saves a new payment method and emits METHOD_SAVED', async () => {
      mockSmCount.mockResolvedValue(0); // not opted out
      mockSmFindOneBy.mockResolvedValue(null); // no existing record

      await service.handleWebhook(makeSucceededPayload(), '127.0.0.1');

      expect(mockSmCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '42',
          provider: 'yookassa',
          paymentMethodId: 'pm_1',
          paymentMethodType: 'bank_card',
          title: 'Visa 1234',
          isActive: true,
          card: expect.objectContaining({
            last4: '1234',
            expiryMonth: '12',
            expiryYear: '2030',
            cardType: 'Visa',
          }),
        }),
      );
      expect(mockSmSave).toHaveBeenCalled();
      expect(mockEmit).toHaveBeenCalledWith(
        WebhookEventEnum['payment.method_saved'],
        expect.objectContaining({
          telegramId: 42,
          provider: 'yookassa',
          paymentMethodType: 'bank_card',
        }),
      );
    });

    it('does NOT re-save when a record with same paymentMethodId exists', async () => {
      mockSmCount.mockResolvedValue(0); // not opted out
      mockSmFindOneBy.mockResolvedValue({ id: 'existing', paymentMethodId: 'pm_1' });

      await service.handleWebhook(makeSucceededPayload(), '127.0.0.1');

      expect(mockSmCreate).not.toHaveBeenCalled();
      expect(mockSmSave).not.toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalledWith(
        WebhookEventEnum['payment.method_saved'],
        expect.anything(),
      );
    });

    it('does NOT save when user has opted out (records exist but zero active)', async () => {
      // totalCount > 0, activeCount === 0
      mockSmCount.mockResolvedValueOnce(2).mockResolvedValueOnce(0);

      await service.handleWebhook(makeSucceededPayload(), '127.0.0.1');

      expect(mockSmFindOneBy).not.toHaveBeenCalled();
      expect(mockSmCreate).not.toHaveBeenCalled();
      expect(mockSmSave).not.toHaveBeenCalled();
    });

    it('saves for new users (zero records → not opted out)', async () => {
      mockSmCount.mockResolvedValue(0);
      mockSmFindOneBy.mockResolvedValue(null);

      await service.handleWebhook(makeSucceededPayload(), '127.0.0.1');

      expect(mockSmCreate).toHaveBeenCalled();
      expect(mockSmSave).toHaveBeenCalled();
    });

    it('saves when user has at least one active saved method', async () => {
      mockSmCount.mockResolvedValueOnce(2).mockResolvedValueOnce(1);
      mockSmFindOneBy.mockResolvedValue(null);

      await service.handleWebhook(makeSucceededPayload(), '127.0.0.1');

      expect(mockSmCreate).toHaveBeenCalled();
    });

    it('skips saving when payment_method.saved is false', async () => {
      mockSmCount.mockResolvedValue(0);

      const payload = makeSucceededPayload();
      (payload.object.payment_method as { saved: boolean }).saved = false;

      await service.handleWebhook(payload, '127.0.0.1');

      expect(mockSmFindOneBy).not.toHaveBeenCalled();
      expect(mockSmCreate).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────
  // Validators
  // ─────────────────────────────────────────────────────────
  describe('isValidNotificationEvent', () => {
    it('accepts known events', () => {
      expect(service.isValidNotificationEvent('payment.succeeded')).toBe(true);
      expect(service.isValidNotificationEvent('payment.canceled')).toBe(true);
      expect(service.isValidNotificationEvent('payment.waiting_for_capture')).toBe(true);
    });

    it('rejects unknown events', () => {
      expect(service.isValidNotificationEvent('payment.unknown')).toBe(false);
      expect(service.isValidNotificationEvent('')).toBe(false);
    });
  });

  describe('isValidWebhookPayload', () => {
    it('accepts a well-formed payload', () => {
      expect(service.isValidWebhookPayload(makeSucceededPayload() as any)).toBe(true);
    });

    it('rejects payload without object', () => {
      expect(
        service.isValidWebhookPayload({ type: 'notification', event: 'payment.succeeded' } as any),
      ).toBe(false);
    });

    it('rejects wrong type', () => {
      expect(
        service.isValidWebhookPayload({
          ...makeSucceededPayload(),
          type: 'other',
        } as any),
      ).toBe(false);
    });

    it('rejects unknown events', () => {
      expect(
        service.isValidWebhookPayload({
          ...makeSucceededPayload(),
          event: 'bogus',
        } as any),
      ).toBe(false);
    });
  });

  describe('isIPRangeValid', () => {
    beforeEach(() => {
      // Re-instantiate with a valid IP set (read from env at construction time).
      process.env.YOOKASSA_PAYMENT_VALID_IP_ADDRESS = JSON.stringify([
        '185.71.76.0/27',
        '185.71.77.0/27',
      ]);
      service = new YookassaService(
        yooKassaProvider,
        yookassaPaymentRepo,
        savedMethodRepo,
        paymentStatusService,
        eventEmitter,
        autopaymentService,
      );
    });

    it('returns true for an IP inside the allowed CIDR', async () => {
      expect(await service.isIPRangeValid('185.71.76.1')).toBe(true);
    });

    it('returns false for an IP outside the allowed CIDR', async () => {
      expect(await service.isIPRangeValid('8.8.8.8')).toBe(false);
    });
  });
});
