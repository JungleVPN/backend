import * as crypto from 'node:crypto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { UserDto, YookassaWebhookPayload } from '@workspace/types';
import axios from 'axios';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  private get paymentsBaseUrl(): string {
    return this.configService.get<string>('PAYMENTS_URL', 'http://localhost:3001');
  }

  validateAndProcessRemna(
    signature: string,
    payload: { event: string; data: UserDto; timestamp: string },
  ) {
    const isProd = this.configService.get<string>('NODE_ENV') === 'production';

    if (isProd) {
      const secret = this.configService.get<string>('REMNAWAVE_WEBHOOK_SECRET', '');
      const expected = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expected !== signature) {
        throw new BadRequestException('Invalid signature');
      }
    }

    this.eventEmitter.emit(payload.event, payload);
  }

  validateAndProcessTorrent(
    token: string,
    payload: {
      username: string;
      ip: string;
      server: string;
      action: string;
      duration: string;
      timestamp: string;
    },
  ) {
    const expectedToken = this.configService.get<string>('REMNAWAVE_TORRENT_WEBHOOK_TOKEN', '');
    if (token !== expectedToken) {
      throw new BadRequestException('Invalid token');
    }

    this.eventEmitter.emit('torrent.event', payload);
  }

  async forwardStripeWebhook(rawBody: Buffer, signature: string): Promise<void> {
    try {
      await axios.post(`${this.paymentsBaseUrl}/payments/stripe/webhook`, rawBody, {
        headers: {
          'content-type': 'application/json',
          'stripe-signature': signature,
        },
        // Send raw buffer, don't let axios transform it
        transformRequest: [(data: Buffer) => data],
      });
    } catch (error) {
      this.logger.error('Failed to forward Stripe webhook to payments service', error);
      throw error;
    }
  }

  async forwardYookassaWebhook(payload: YookassaWebhookPayload, ip: string): Promise<void> {
    try {
      await axios.post(`${this.paymentsBaseUrl}/payments/yookassa/webhook`, payload, {
        headers: {
          'x-forwarded-for': ip,
        },
      });
    } catch (error) {
      this.logger.error('Failed to forward Yookassa webhook to payments service', error);
      throw error;
    }
  }
}
