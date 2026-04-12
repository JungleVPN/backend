import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebhookService } from './webhook.service';

const mockAxiosPost = vi.fn().mockResolvedValue({ status: 200 });

vi.mock('axios', () => ({
  default: {
    post: (...args: any[]) => mockAxiosPost(...args),
  },
}));

describe('WebhookService', () => {
  let service: WebhookService;

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn((key: string, fallback?: string): string => {
      const map: Record<string, string> = {
        PAYMENTS_URL: 'http://payments:3001',
      };
      return map[key] ?? fallback ?? '';
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhookService(
      mockEventEmitter as unknown as EventEmitter2,
      mockConfigService as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── validateAndProcessRemna ────────────────────────────────────────

  describe('validateAndProcessRemna', () => {
    it('throws BadRequestException for invalid signature in production', async () => {
      mockConfigService.get.mockImplementation((key: string, fallback?: string): string => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'REMNAWAVE_WEBHOOK_SECRET') return 'secret';
        return fallback ?? '';
      });
      service = new WebhookService(
        mockEventEmitter as unknown as EventEmitter2,
        mockConfigService as any,
      );

      const payload = { event: 'test', data: {}, timestamp: '123' } as any;
      await expect(service.validateAndProcessRemna('invalid', payload)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('forwards user.expires_in_24_hours to payments service via HTTP', async () => {
      const payload = {
        event: 'user.expires_in_24_hours',
        data: { uuid: '1', telegramId: 42 },
        timestamp: '123',
      } as any;

      await service.validateAndProcessRemna('any', payload);

      expect(mockAxiosPost).toHaveBeenCalledWith(
        'http://payments:3001/payments/remnawave-event',
        payload,
        expect.objectContaining({ timeout: 10_000 }),
      );
    });

    it('does NOT forward non-payment events to payments service', async () => {
      const payload = {
        event: 'user.created',
        data: { uuid: '1' },
        timestamp: '123',
      } as any;

      await service.validateAndProcessRemna('any', payload);

      expect(mockAxiosPost).not.toHaveBeenCalled();
    });

    it('does not throw when forwarding fails', async () => {
      mockAxiosPost.mockRejectedValueOnce(new Error('payments down'));
      const payload = {
        event: 'user.expires_in_24_hours',
        data: { uuid: '1', telegramId: 42 },
        timestamp: '123',
      } as any;

      // Should not throw — failure is logged but swallowed
      await expect(service.validateAndProcessRemna('any', payload)).resolves.toBeUndefined();
    });
  });

  // ── validateAndProcessTorrent ──────────────────────────────────────

  describe('validateAndProcessTorrent', () => {
    beforeEach(() => {
      mockConfigService.get.mockImplementation((key: string, fallback?: string): string => {
        if (key === 'REMNAWAVE_TORRENT_WEBHOOK_TOKEN') return 'token';
        return fallback ?? '';
      });
      service = new WebhookService(
        mockEventEmitter as unknown as EventEmitter2,
        mockConfigService as any,
      );
    });

    it('throws BadRequestException for invalid token', () => {
      const payload = {} as any;
      expect(() => service.validateAndProcessTorrent('invalid', payload)).toThrow(
        BadRequestException,
      );
    });

    it('emits event for valid token', () => {
      const payload = { username: 'test' } as any;
      service.validateAndProcessTorrent('token', payload);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('torrent.event', payload);
    });
  });

  // ── forwardStripeWebhook ───────────────────────────────────────────

  describe('forwardStripeWebhook', () => {
    it('forwards raw body and signature to payments service', async () => {
      const rawBody = Buffer.from('{"test": true}');
      await service.forwardStripeWebhook(rawBody, 'sig_123');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/payments/stripe/webhook'),
        rawBody,
        expect.objectContaining({
          headers: expect.objectContaining({
            'stripe-signature': 'sig_123',
          }),
        }),
      );
    });
  });

  // ── forwardYookassaWebhook ─────────────────────────────────────────

  describe('forwardYookassaWebhook', () => {
    it('forwards payload and IP to payments service', async () => {
      const payload = { type: 'notification', event: 'payment.succeeded', object: {} } as any;
      await service.forwardYookassaWebhook(payload, '1.2.3.4');

      expect(mockAxiosPost).toHaveBeenCalledWith(
        expect.stringContaining('/payments/yookassa/webhook'),
        payload,
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-forwarded-for': '1.2.3.4',
          }),
        }),
      );
    });
  });
});
