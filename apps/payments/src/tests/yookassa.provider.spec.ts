import 'reflect-metadata';
import * as process from 'node:process';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock axios so the provider's internal `axios.create(...)` returns a fake client.
const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        post: mockPost,
        get: mockGet,
      })),
    },
  };
});

describe('YooKassaProvider', () => {
  let provider: YooKassaProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.YOOKASSA_URL = 'https://api.yookassa.test';
    process.env.YOOKASSA_SHOP_ID = 'shop';
    process.env.YOOKASSA_API_KEY = 'key';
    process.env.RETURN_URL = 'https://return.test';

    // Reference `axios` to silence the unused-import TS error while ensuring the mock is applied.
    void axios;

    provider = new YooKassaProvider();
  });

  describe('createPayment', () => {
    it('sends a create payment request and returns session id + confirmation url', async () => {
      mockPost.mockResolvedValue({
        data: {
          id: 'pay_1',
          confirmation: { confirmation_url: 'https://yk/pay_1' },
        },
      });

      const result = await provider.createPayment({
        userId: 'user-1',
        payment: { amount: 100, description: 'desc' },
        metadata: { telegramId: 1, selectedPeriod: 1 },
        savePaymentMethod: false,
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url, body, config] = mockPost.mock.calls[0];

      expect(url).toBe('/');
      expect(body).toEqual(
        expect.objectContaining({
          amount: { value: 100, currency: 'RUB' },
          capture: true,
          confirmation: {
            type: 'redirect',
            return_url: 'https://return.test',
          },
          description: 'desc',
          metadata: { telegramId: 1, selectedPeriod: 1 },
        }),
      );
      expect(body.save_payment_method).toBeUndefined();
      expect(config.headers['Idempotence-Key']).toBeDefined();

      expect(result).toEqual({ id: 'pay_1', url: 'https://yk/pay_1' });
    });

    it('includes save_payment_method=true when dto.savePaymentMethod is true', async () => {
      mockPost.mockResolvedValue({
        data: { id: 'pay_2', confirmation: { confirmation_url: 'https://yk/pay_2' } },
      });

      await provider.createPayment({
        userId: 'user-1',
        payment: { amount: 200 },
        savePaymentMethod: true,
      });

      const [, body] = mockPost.mock.calls[0];
      expect(body.save_payment_method).toBe(true);
    });

    it('omits save_payment_method when dto.savePaymentMethod is false', async () => {
      mockPost.mockResolvedValue({
        data: { id: 'pay_3', confirmation: { confirmation_url: 'https://yk/pay_3' } },
      });

      await provider.createPayment({
        userId: 'user-1',
        payment: { amount: 300 },
        savePaymentMethod: false,
      });

      const [, body] = mockPost.mock.calls[0];
      expect(body.save_payment_method).toBeUndefined();
    });

    it('rethrows on axios error', async () => {
      mockPost.mockRejectedValue(new Error('network'));

      await expect(
        provider.createPayment({ userId: 'u', payment: { amount: 1 }, savePaymentMethod: false }),
      ).rejects.toThrow('network');
    });
  });

  describe('createAutopayment', () => {
    it('sends payment_method_id and returns the raw API response', async () => {
      const apiResponse = {
        id: 'pay_auto',
        status: 'payment.succeeded',
        paid: true,
        amount: { value: '500', currency: 'RUB' },
      };
      mockPost.mockResolvedValue({ data: apiResponse });

      const result = await provider.createAutopayment({
        userId: 'user-1',
        paymentMethodId: 'pm_1',
        amount: 500,
        selectedPeriod: 1,
        description: 'auto',
      });

      expect(mockPost).toHaveBeenCalledTimes(1);
      const [url, body, config] = mockPost.mock.calls[0];

      expect(url).toBe('/');
      expect(body).toEqual(
        expect.objectContaining({
          amount: { value: '500', currency: 'RUB' },
          capture: true,
          payment_method_id: 'pm_1',
          description: 'auto',
          metadata: {
            telegramId: 'user-1',
            selectedPeriod: 1,
          },
        }),
      );
      // No confirmation object: autopayments charge immediately.
      expect(body.confirmation).toBeUndefined();
      expect(config.headers['Idempotence-Key']).toBeDefined();

      expect(result).toBe(apiResponse);
    });

    it('falls back to default description when not provided', async () => {
      mockPost.mockResolvedValue({ data: { id: 'x', status: 'payment.succeeded' } });

      await provider.createAutopayment({
        userId: 'user-1',
        paymentMethodId: 'pm_1',
        amount: 100,
        selectedPeriod: 1,
      });

      const [, body] = mockPost.mock.calls[0];
      expect(body.description).toBe('Happy to see you in the JUNGLE 🌴');
    });
  });

  describe('checkPaymentStatus', () => {
    it('fetches by id and returns the status', async () => {
      mockGet.mockResolvedValue({ data: { status: 'payment.succeeded' } });

      const status = await provider.checkPaymentStatus('pay_1');

      expect(mockGet).toHaveBeenCalledWith('/pay_1');
      expect(status).toBe('payment.succeeded');
    });

    it('rethrows on axios error', async () => {
      mockGet.mockRejectedValue(new Error('boom'));
      await expect(provider.checkPaymentStatus('pay_1')).rejects.toThrow('boom');
    });
  });
});
