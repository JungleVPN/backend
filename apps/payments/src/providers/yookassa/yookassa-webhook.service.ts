import * as process from 'node:process';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import type {
  YookassaNotificationEvent,
  YookassaWebhookPayload,
} from '@payments/providers/yookassa/yookassa.model';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { PaymentStatusService } from '../../payment-status/payment-status.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Injectable()
export class YookassaWebhookService {
  private readonly logger = new Logger(YookassaWebhookService.name);
  private readonly validIpAddresses: string[] = JSON.parse(
    process.env.YOOKASSA_PAYMENT_VALID_IP_ADDRESS || '[]',
  );

  constructor(
    @Inject(forwardRef(() => YooKassaProvider))
    readonly yooKassaProvider: YooKassaProvider,
    private readonly paymentStatusService: PaymentStatusService,
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

      if (event === 'payment.succeeded') {
        await this.handlePaymentSucceeded(payload);
      }
    } catch (apiError) {
      this.logger.error(`API verification failed for payment ${paymentId}`, apiError);
    }
  }

  private async handlePaymentSucceeded(payload: YookassaWebhookPayload): Promise<void> {
    const { metadata } = payload.object;
    if (!metadata?.telegramId) {
      this.logger.warn('No telegramId in Yookassa payment metadata');
      return;
    }

    const telegramId = Number(metadata.telegramId);
    const selectedPeriod = Number(metadata.selectedPeriod);

    if (!telegramId || !selectedPeriod) {
      this.logger.warn('Invalid telegramId or selectedPeriod in Yookassa metadata');
      return;
    }

    await this.paymentStatusService.handlePaymentSucceeded(telegramId, selectedPeriod);
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
