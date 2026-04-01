import * as crypto from 'node:crypto';
import * as process from 'node:process';
import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { YookassaWebhookPayload } from '@payments/providers/yookassa/yookassa.model';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import type { UserDto, WebHookEvent } from '@workspace/types';
import type Stripe from 'stripe';

@Injectable()
export class WebhookService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly stripeProvider: StripeProvider,
    private readonly yooKassaProvider: YooKassaProvider,
  ) {}

  validateAndProcessRemna(
    signature: string,
    payload: { event: WebHookEvent; data: UserDto; timestamp: string },
  ) {
    const isProd = process.env.NODE_ENV === 'production';

    if (isProd) {
      const secret = process.env.REMNA_WEBHOOK_SECRET || '';
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
    const expectedToken = process.env.REMNA_TORRENT_WEBHOOK_TOKEN || '';
    if (token !== expectedToken) {
      throw new BadRequestException('Invalid token');
    }

    this.eventEmitter.emit('torrent.event', payload);
  }

  async handleStripeWebhook(event: Stripe.Event) {
    await this.stripeProvider.handleWebhook(event);
  }

  async handleYookassaWebhook(payload: YookassaWebhookPayload, ip: string) {
    await this.yooKassaProvider.handleWebhook(payload, ip);
  }
}
