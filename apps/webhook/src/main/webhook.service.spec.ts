import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebhookService } from './webhook.service';

vi.mock('axios', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ status: 200 }),
  },
}));

describe('WebhookService', () => {
  let service: WebhookService;

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  const mockEventConfigService = {
    emit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new WebhookService(
      mockEventEmitter as unknown as EventEmitter2,
      mockEventConfigService as any,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateAndProcessRemna', () => {
    it('should throw BadRequestException for invalid signature in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.REMNAWAVE_WEBHOOK_SECRET = 'secret';
      const payload = { event: 'test', data: {}, timestamp: '123' } as any;
      expect(() => service.validateAndProcessRemna('invalid', payload)).toThrow(
        BadRequestException,
      );
    });

    it('should emit event in non-production without signature check', () => {
      process.env.NODE_ENV = 'development';
      const payload = { event: 'user.created', data: { uuid: '1' }, timestamp: '123' } as any;
      service.validateAndProcessRemna('any', payload);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('user.created', payload);
    });
  });

  describe('validateAndProcessTorrent', () => {
    it('should throw BadRequestException for invalid token', () => {
      process.env.REMNAWAVE_TORRENT_WEBHOOK_TOKEN = 'token';
      const payload = {} as any;
      expect(() => service.validateAndProcessTorrent('invalid', payload)).toThrow(
        BadRequestException,
      );
    });

    it('should emit event for valid token', () => {
      process.env.REMNAWAVE_TORRENT_WEBHOOK_TOKEN = 'token';
      const payload = { username: 'test' } as any;
      service.validateAndProcessTorrent('token', payload);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('torrent.event', payload);
    });
  });

  describe('forwardStripeWebhook', () => {
    it('should forward raw body and signature to payments service', async () => {
      const axios = (await import('axios')).default;
      const rawBody = Buffer.from('{"test": true}');
      await service.forwardStripeWebhook(rawBody, 'sig_123');

      expect(axios.post).toHaveBeenCalledWith(
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

  describe('forwardYookassaWebhook', () => {
    it('should forward payload and IP to payments service', async () => {
      const axios = (await import('axios')).default;
      const payload = { type: 'notification', event: 'payment.succeeded', object: {} } as any;
      await service.forwardYookassaWebhook(payload, '1.2.3.4');

      expect(axios.post).toHaveBeenCalledWith(
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
