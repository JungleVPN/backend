import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { YookassaController } from '@payments/providers/yookassa/yookassa.controller';
import type { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import type { YookassaWebhookService } from '@payments/providers/yookassa/yookassa-webhook.service';
import type { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PAYMENT_EVENTS } from '../notifications/payment-events';

vi.mock('@workspace/database', () => {
  return {
    YookassaPayment: class {},
    SavedPaymentMethod: class {},
  };
});

describe('YookassaController', () => {
  let controller: YookassaController;

  let yookassaPaymentRepo: Repository<YookassaPayment>;
  let savedMethodRepo: Repository<SavedPaymentMethod>;
  let yookassaWebhookService: YookassaWebhookService;
  let yookassaProvider: YooKassaProvider;
  let eventEmitter: EventEmitter2;

  // Repo mocks
  let mockYkFind: any;
  let mockYkFindOneBy: any;
  let mockYkCreate: any;
  let mockYkSave: any;

  let mockSmFind: any;
  let mockSmFindOneBy: any;
  let mockSmSave: any;
  let mockSmCount: any;

  // Webhook / provider / emitter mocks
  let mockHandleWebhook: any;
  let mockCreatePayment: any;
  let mockCreateAutopayment: any;
  let mockEmit: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockYkFind = vi.fn();
    mockYkFindOneBy = vi.fn();
    mockYkCreate = vi.fn((data: any) => data);
    mockYkSave = vi.fn(async (v: any) => v);

    yookassaPaymentRepo = {
      find: mockYkFind,
      findOneBy: mockYkFindOneBy,
      create: mockYkCreate,
      save: mockYkSave,
    } as unknown as Repository<YookassaPayment>;

    mockSmFind = vi.fn();
    mockSmFindOneBy = vi.fn();
    mockSmSave = vi.fn(async (v: any) => v);
    mockSmCount = vi.fn();

    savedMethodRepo = {
      find: mockSmFind,
      findOneBy: mockSmFindOneBy,
      save: mockSmSave,
      count: mockSmCount,
    } as unknown as Repository<SavedPaymentMethod>;

    mockHandleWebhook = vi.fn();
    yookassaWebhookService = {
      handleWebhook: mockHandleWebhook,
    } as unknown as YookassaWebhookService;

    mockCreatePayment = vi.fn();
    mockCreateAutopayment = vi.fn();
    yookassaProvider = {
      createPayment: mockCreatePayment,
      createAutopayment: mockCreateAutopayment,
    } as unknown as YooKassaProvider;

    mockEmit = vi.fn();
    eventEmitter = {
      emit: mockEmit,
    } as unknown as EventEmitter2;

    controller = new YookassaController(
      yookassaPaymentRepo,
      savedMethodRepo,
      yookassaWebhookService,
      yookassaProvider,
      eventEmitter,
    );
  });

  // ─────────────────────────────────────────────────────────
  // Saved methods
  // ─────────────────────────────────────────────────────────
  describe('getSavedMethods', () => {
    it('returns active saved methods for the user, newest first', async () => {
      const methods = [{ id: '1' }, { id: '2' }];
      mockSmFind.mockResolvedValue(methods);

      const result = await controller.getSavedMethods('user-1');

      expect(mockSmFind).toHaveBeenCalledWith({
        where: { userId: 'user-1', isActive: true },
        order: { createdAt: 'DESC' },
      });
      expect(result).toBe(methods);
    });
  });

  describe('disableSavedMethod', () => {
    it('soft-deletes the method when it exists', async () => {
      const method = { id: 'm1', userId: 'u1', isActive: true };
      mockSmFindOneBy.mockResolvedValue(method);

      const result = await controller.disableSavedMethod('m1');

      expect(method.isActive).toBe(false);
      expect(mockSmSave).toHaveBeenCalledWith(method);
      expect(result).toEqual({ disabled: true });
    });

    it('throws NotFoundException when method does not exist', async () => {
      mockSmFindOneBy.mockResolvedValue(null);

      await expect(controller.disableSavedMethod('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(mockSmSave).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────
  // Payments CRUD
  // ─────────────────────────────────────────────────────────
  describe('list', () => {
    it('returns all payments newest first', async () => {
      const payments = [{ id: 'p1' }];
      mockYkFind.mockResolvedValue(payments);

      const result = await controller.list();

      expect(mockYkFind).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
      expect(result).toBe(payments);
    });
  });

  describe('getById', () => {
    it('returns payment when found', async () => {
      const payment = { id: 'p1' };
      mockYkFindOneBy.mockResolvedValue(payment);

      const result = await controller.getById('p1');
      expect(result).toBe(payment);
    });

    it('throws NotFoundException when payment is missing', async () => {
      mockYkFindOneBy.mockResolvedValue(null);
      await expect(controller.getById('missing')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('updates status and paidAt when provided', async () => {
      const payment: any = { id: 'p1', status: 'pending', paidAt: null };
      mockYkFindOneBy.mockResolvedValue(payment);

      await controller.updateStatus('p1', {
        status: 'payment.succeeded',
        paidAt: '2026-01-01T00:00:00Z',
      });

      expect(payment.status).toBe('payment.succeeded');
      expect(payment.paidAt).toBeInstanceOf(Date);
      expect(mockYkSave).toHaveBeenCalledWith(payment);
    });

    it('clears paidAt when set to null', async () => {
      const payment: any = { id: 'p1', status: 'pending', paidAt: new Date() };
      mockYkFindOneBy.mockResolvedValue(payment);

      await controller.updateStatus('p1', { paidAt: null });

      expect(payment.paidAt).toBeNull();
    });

    it('throws when payment not found', async () => {
      mockYkFindOneBy.mockResolvedValue(null);
      await expect(controller.updateStatus('x', { status: 'y' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // createSession (opt-out logic)
  // ─────────────────────────────────────────────────────────
  describe('createSession', () => {
    const baseDto = {
      userId: 'user-1',
      payment: { amount: 100, description: 'test' },
    };

    beforeEach(() => {
      mockCreatePayment.mockResolvedValue({
        id: 'sess-1',
        url: 'https://yk/sess-1',
      });
    });

    it('uses explicit savePaymentMethod=false without consulting opt-out', async () => {
      await controller.createSession({ ...baseDto, savePaymentMethod: false });

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ savePaymentMethod: false }),
      );
      expect(mockSmCount).not.toHaveBeenCalled();
    });

    it('uses explicit savePaymentMethod=true without consulting opt-out', async () => {
      await controller.createSession({ ...baseDto, savePaymentMethod: true });

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ savePaymentMethod: true }),
      );
      expect(mockSmCount).not.toHaveBeenCalled();
    });

    it('defaults savePaymentMethod to true for a new user (no records)', async () => {
      mockSmCount.mockResolvedValueOnce(0); // totalCount

      await controller.createSession(baseDto);

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ savePaymentMethod: true }),
      );
    });

    it('defaults savePaymentMethod to true when user has active records', async () => {
      mockSmCount
        .mockResolvedValueOnce(2) // totalCount
        .mockResolvedValueOnce(1); // activeCount

      await controller.createSession(baseDto);

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ savePaymentMethod: true }),
      );
    });

    it('defaults savePaymentMethod to false when user has opted out', async () => {
      mockSmCount
        .mockResolvedValueOnce(3) // totalCount
        .mockResolvedValueOnce(0); // activeCount => opted out

      await controller.createSession(baseDto);

      expect(mockCreatePayment).toHaveBeenCalledWith(
        expect.objectContaining({ savePaymentMethod: false }),
      );
    });

    it('persists the payment record and returns the provider session', async () => {
      mockSmCount.mockResolvedValueOnce(0);

      const result = await controller.createSession(baseDto);

      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'sess-1',
          url: 'https://yk/sess-1',
          status: 'pending',
          amount: 100,
          currency: 'RUB',
          userId: 'user-1',
          description: 'test',
        }),
      );
      expect(mockYkSave).toHaveBeenCalled();
      expect(result).toEqual({ id: 'sess-1', url: 'https://yk/sess-1' });
    });
  });

  // ─────────────────────────────────────────────────────────
  // Webhook
  // ─────────────────────────────────────────────────────────
  describe('webhook', () => {
    it('delegates to the webhook service and returns { received: true }', async () => {
      const payload: any = { type: 'notification', event: 'payment.succeeded' };
      const result = await controller.webhook(payload, '127.0.0.1');

      expect(mockHandleWebhook).toHaveBeenCalledWith(payload, '127.0.0.1');
      expect(result).toEqual({ received: true });
    });
  });

  // ─────────────────────────────────────────────────────────
  // createAutopayment
  // ─────────────────────────────────────────────────────────
  describe('createAutopayment', () => {
    const dto = {
      userId: 'user-1',
      amount: 500,
      selectedPeriod: 1,
      description: 'autopay',
    };

    it('throws when no active saved method exists', async () => {
      mockSmFindOneBy.mockResolvedValue(null);

      await expect(controller.createAutopayment(dto)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCreateAutopayment).not.toHaveBeenCalled();
    });

    it('creates autopayment, saves record and does NOT emit on success', async () => {
      mockSmFindOneBy.mockResolvedValue({
        userId: 'user-1',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_1',
        status: 'payment.succeeded',
      });

      const result = await controller.createAutopayment(dto);

      expect(mockCreateAutopayment).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          paymentMethodId: 'pm_1',
          amount: 500,
          selectedPeriod: 1,
          description: 'autopay',
        }),
      );
      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_1',
          status: 'payment.succeeded',
          amount: 500,
          userId: 'user-1',
          paidAt: expect.any(Date),
        }),
      );
      expect(mockYkSave).toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
      expect(result).toEqual({
        paymentId: 'pay_1',
        status: 'payment.succeeded',
        cancellationDetails: undefined,
      });
    });

    it('emits AUTOPAYMENT_FAILED when provider returns canceled', async () => {
      mockSmFindOneBy.mockResolvedValue({
        userId: 'user-1',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
      mockCreateAutopayment.mockResolvedValue({
        id: 'pay_2',
        status: 'payment.canceled',
        cancellation_details: {
          reason: 'insufficient_funds',
          party: 'payment_network',
        },
      });

      const result = await controller.createAutopayment(dto);

      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'payment.canceled',
          paidAt: null,
        }),
      );
      expect(mockEmit).toHaveBeenCalledWith(
        PAYMENT_EVENTS.AUTOPAYMENT_FAILED,
        expect.objectContaining({
          telegramId: Number(dto.userId),
          provider: 'yookassa',
          selectedPeriod: 1,
          reason: 'insufficient_funds',
          party: 'payment_network',
        }),
      );
      expect(result.cancellationDetails).toEqual({
        reason: 'insufficient_funds',
        party: 'payment_network',
      });
    });
  });
});
