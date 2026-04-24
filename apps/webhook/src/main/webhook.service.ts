import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { PaymentWebhookNotification, TRemnawaveWebhookEvent } from '@workspace/types';
import { REMNAWAVE_EVENTS } from '@workspace/types';
import axios from 'axios';

/** Events that should be forwarded to the payments service for processing. */
const PAYMENT_FORWARDED_EVENTS = new Set<TRemnawaveWebhookEvent['event']>([
  REMNAWAVE_EVENTS.USER.EXPIRE_NOTIFY_EXPIRES_IN_24_HOURS,
]);

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

  /**
   * Processes a Remnawave event that has already been signature-verified by
   * RemnaSignatureGuard.  Do not call this directly without first validating
   * the HMAC signature.
   */
  async processRemnaEvent(payload: TRemnawaveWebhookEvent): Promise<void> {
    if (PAYMENT_FORWARDED_EVENTS.has(payload.event)) {
      await this.forwardRemnaEventToPayments(payload);
    }
  }

  private async forwardRemnaEventToPayments(payload: TRemnawaveWebhookEvent): Promise<void> {
    try {
      await axios.post(`${this.paymentsBaseUrl}/payments/remnawave-event`, payload, {
        timeout: 10_000,
      });
    } catch (error: any) {
      this.logger.error(`Failed to forward remnawave event ${payload.event} to payments: ${error}`);
    }
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

  async forwardYookassaWebhook(payload: PaymentWebhookNotification, ip: string): Promise<void> {
    await axios.post(`${this.paymentsBaseUrl}/payments/yookassa/webhook`, payload, {
      headers: {
        'x-forwarded-for': ip,
      },
    });
  }
}
