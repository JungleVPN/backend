import 'reflect-metadata';
import { NotFoundException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import { YookassaController } from '@payments/providers/yookassa/yookassa.controller';
import type { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import type { YookassaService } from '@payments/providers/yookassa/yookassa.service';
import type { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { Payments, WebhookEventEnum } from '@workspace/types';
import type { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  let YookassaService: YookassaService;
  let yookassaProvider: YooKassaProvider;
  let eventEmitter: EventEmitter2;

  let mockYkFind: any;
  let mockYkFindOneBy: any;
  let mockYkCreate: any;
  let mockYkSave: any;

  let mockSmFind: any;
  let mockSmFindOneBy: any;
  let mockSmSave: any;

  let mockHandleWebhook: any;
  let mockCreate: any;
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

    savedMethodRepo = {
      find: mockSmFind,
      findOneBy: mockSmFindOneBy,
      save: mockSmSave,
    } as unknown as Repository<SavedPaymentMethod>;

    mockHandleWebhook = vi.fn();
    YookassaService = {
      handleWebhook: mockHandleWebhook,
    } as unknown as YookassaService;

    mockCreate = vi.fn();
    yookassaProvider = {
      create: mockCreate,
    } as unknown as YooKassaProvider;

    mockEmit = vi.fn();
    eventEmitter = {
      emit: mockEmit,
    } as unknown as EventEmitter2;

    controller = new YookassaController(
      yookassaPaymentRepo,
      savedMethodRepo,
      YookassaService,
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
        status: 'succeeded',
        paidAt: '2026-01-01T00:00:00Z',
      });

      expect(payment.status).toBe('succeeded');
      expect(payment.paidAt).toBeInstanceOf(Date);
      expect(mockYkSave).toHaveBeenCalledWith(payment);
    });

    it('throws when payment not found', async () => {
      mockYkFindOneBy.mockResolvedValue(null);
      await expect(controller.updateStatus('x', { status: 'succeeded' })).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────────────────
  // createSession
  // ─────────────────────────────────────────────────────────
  describe('createSession', () => {
    const baseDto: Payments.CreatePaymentRequest = {
      metadata: {
        userId: 'user-1',
        telegramId: 123,
        selectedPeriod: 1,
      },
      amount: {
        value: '100.00',
        currency: 'RUB',
      },
      description: 'test',
      save_payment_method: true,
    };

    it('creates the payment, persists the record and returns { id, url }', async () => {
      mockSmFindOneBy.mockResolvedValue(null); // no existing active method
      mockCreate.mockResolvedValue({
        id: 'sess-1',
        status: 'pending',
        amount: {
          value: '100.00',
          currency: 'RUB',
        },
        paidAt: '2026-01-01T00:00:00Z',
        metadata: null,
        description: 'test',
        confirmation: { type: 'redirect', confirmation_url: 'https://yk/sess-1' },
      });

      const result = await controller.createSession(baseDto);

      const [request] = mockCreate.mock.calls[0];
      expect(request).toEqual(
        expect.objectContaining({
          amount: { value: '100.00', currency: 'RUB' },
          capture: true,
          confirmation: expect.objectContaining({ type: 'redirect' }),
          description: 'test',
          save_payment_method: true,
        }),
      );

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

    it('omits save_payment_method when dto.savePaymentMethod is false', async () => {
      mockSmFindOneBy.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        id: 'sess-2',
        status: 'pending',
        confirmation: { type: 'redirect', confirmation_url: 'https://yk/sess-2' },
      });

      await controller.createSession({
        ...baseDto,
        save_payment_method: false,
      });

      const [request] = mockCreate.mock.calls[0];
      expect(request.save_payment_method).toBeFalsy();
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
      expect(result).toEqual({ ok: true });
    });
  });

  // ─────────────────────────────────────────────────────────
  // makeAutopayment
  // ─────────────────────────────────────────────────────────
  describe('makeAutopayment', () => {
    const dto = {
      telegramId: 123,
      userId: 'user-1',
      amount: 500,
      selectedPeriod: 1,
      description: 'autopay',
    };

    it('throws when no active saved method exists', async () => {
      mockSmFindOneBy.mockResolvedValue(null);

      await expect(controller.makeAutopayment(dto)).rejects.toBeInstanceOf(NotFoundException);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('builds a payment_method_id request, persists, and does NOT emit on success', async () => {
      mockSmFindOneBy.mockResolvedValue({
        userId: 'user-1',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
      mockCreate.mockResolvedValue({
        id: 'pay_1',
        status: 'succeeded',
      });

      const result = await controller.makeAutopayment(dto);

      const [request] = mockCreate.mock.calls[0];
      expect(request).toEqual(
        expect.objectContaining({
          amount: { value: '500', currency: 'RUB' },
          capture: true,
          payment_method_id: 'pm_1',
          description: 'autopay',
        }),
      );
      expect(request.confirmation).toBeUndefined();

      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'pay_1',
          status: 'succeeded',
          amount: 500,
          userId: 'user-1',
          paidAt: expect.any(Date),
        }),
      );
      expect(mockYkSave).toHaveBeenCalled();
      expect(mockEmit).not.toHaveBeenCalled();
      expect(result).toEqual({
        id: 'pay_1',
        status: 'succeeded',
      });
    });

    it('emits AUTOPAYMENT_FAILED when provider returns canceled', async () => {
      mockSmFindOneBy.mockResolvedValue({
        userId: 'user-1',
        paymentMethodId: 'pm_1',
        isActive: true,
      });
      mockCreate.mockResolvedValue({
        id: 'pay_2',
        status: 'canceled',
        cancellation_details: {
          reason: 'insufficient_funds',
          party: 'payment_network',
        },
      });

      const result = await controller.makeAutopayment(dto);

      expect(mockYkCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'canceled',
          paidAt: null,
        }),
      );
      expect(mockEmit).toHaveBeenCalledWith(
        WebhookEventEnum['payment.autopayment_failed'],
        expect.objectContaining({
          telegramId: Number(dto.userId),
          provider: 'yookassa',
          reason: 'insufficient_funds',
        }),
      );
      expect(result.cancellation_details).toEqual({
        reason: 'insufficient_funds',
        party: 'payment_network',
      });
    });
  });
});
