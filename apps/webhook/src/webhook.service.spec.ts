import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WebhookService } from './webhook.service';

vi.mock('@workspace/database/entities/payment.entity', () => {
  return {
    Payment: class {},
  };
});

describe('WebhookService', () => {
  let service: WebhookService;

  const mockEventEmitter = {
    emit: vi.fn(),
  };

  const mockStripeProvider = {};
  const mockYookassaProvider = {};

  beforeEach(() => {
    service = new WebhookService(
      mockEventEmitter as unknown as EventEmitter2,
      mockStripeProvider as unknown as StripeProvider,
      mockYookassaProvider as unknown as YooKassaProvider,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateAndProcessRemna', () => {
    it('should throw BadRequestException for invalid signature', () => {
      process.env.REMNA_WEBHOOK_SECRET = 'secret';
      const payload = { event: 'test', data: {}, timestamp: '123' } as any;
      expect(() => service.validateAndProcessRemna('invalid', payload)).toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateAndProcessTorrent', () => {
    it('should throw BadRequestException for invalid token', () => {
      process.env.REMNA_TORRENT_WEBHOOK_TOKEN = 'token';
      const payload = {} as any;
      expect(() => service.validateAndProcessTorrent('invalid', payload)).toThrow(
        BadRequestException,
      );
    });

    it('should emit event for valid token', () => {
      process.env.REMNA_TORRENT_WEBHOOK_TOKEN = 'token';
      const payload = { username: 'test' } as any;
      service.validateAndProcessTorrent('token', payload);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('torrent.event', payload);
    });
  });

  describe('processStripeEvent', () => {
    it('should emit payment.succeeded event with correct payload', async () => {
      const event = {
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            current_period_end: 1700000000,
            metadata: { telegramId: '12345' },
          },
        },
      } as any;

      await service.handleStripeWebhook(event);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith('payment.succeeded', {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'sub_123',
          status: 'active',
          metadata: { telegramId: '12345', selectedPeriod: undefined },
          customer: 'cus_123',
          current_period_end: 1700000000,
        },
      });
    });
  });
});
