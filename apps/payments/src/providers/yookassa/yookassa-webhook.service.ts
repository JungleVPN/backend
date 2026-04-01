import * as process from 'node:process';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  YookassaNotificationEvent,
  YookassaWebhookPayload,
} from '@payments/providers/yookassa/yookassa.model';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Injectable()
export class YookassaWebhookService {
  private readonly logger = new Logger('YookassaWebhookService');
  private readonly validIpAddresses: string[] = JSON.parse(
    process.env.YOOKASSA_PAYMENT_VALID_IP_ADDRESS || '[]',
  );

  constructor(
    @Inject(forwardRef(() => YooKassaProvider))
    readonly yooKassaProvider: YooKassaProvider,
    readonly eventEmitter: EventEmitter2,
  ) {}

  async handleWebhook(payload: YookassaWebhookPayload, ip: string) {
    const isIPRangeValid = await this.isIPRangeValid(ip);
    if (!isIPRangeValid) return;

    if (!this.isValidWebhookPayload(payload)) {
      this.logger.warn('Invalid webhook payload structure');
      return;
    }

    const {
      paymentId,
      status: webhookStatus,
      event,
    } = {
      paymentId: payload.object.id,
      status: payload.object.status,
      event: payload.event,
    };

    try {
      const status = await this.yooKassaProvider.checkPaymentStatus(paymentId);
      if (status !== webhookStatus) {
        this.logger.warn(
          `Payment ${paymentId} status mismatch! Webhook: ${webhookStatus}, API: ${status}. Possible fake webhook.`,
        );
        return;
      }

      this.eventEmitter.emit(event, payload);
    } catch (apiError) {
      console.error(`API verification failed for payment ${paymentId}`, apiError);
    }
  }

  async isIPRangeValid(ip: string): Promise<boolean> {
    const normalizedIps = this.getNormalizedIPs();

    const matcher = new CIDRMatcher(normalizedIps);

    const ips = ip.split(',').map((i) => i.trim());

    if (!ips.some((i) => matcher.contains(i))) {
      this.logger.warn(`Invalid YooKassa IP: ${ip}`);
      return false;
    }

    return true;
  }

  private getNormalizedIPs(): string[] {
    return this.validIpAddresses.map((ipAddr) => {
      if (ipAddr.includes('/')) return ipAddr;
      return ipAddr.includes(':') ? `${ipAddr}/128` : `${ipAddr}/32`;
    });
  }

  isValidNotificationEvent(event: string): event is YookassaNotificationEvent {
    return ['payment.succeeded', 'payment.canceled', 'payment.waiting_for_capture'].includes(event);
  }

  isValidWebhookPayload(payload: YookassaWebhookPayload): boolean {
    return (
      payload?.object &&
      payload.type === 'notification' &&
      this.isValidNotificationEvent(payload.event)
    );
  }
}
