import * as process from 'node:process';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import type {
  YookassaNotificationEvent,
  YookassaPaymentPayload,
  YookassaWebhookPayload,
} from '@payments/providers/yookassa/yookassa.model';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { Repository } from 'typeorm';
import { PAYMENT_EVENTS, PaymentSucceededEvent } from '../../notifications/payment-events';
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
    @InjectRepository(YookassaPayment)
    private readonly yookassaPaymentRepo: Repository<YookassaPayment>,
    private readonly paymentStatusService: PaymentStatusService,
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(SavedPaymentMethod)
    private readonly savedMethodRepo: Repository<SavedPaymentMethod>,
  ) {}

  async handleWebhook(payload: YookassaWebhookPayload, ip: string) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      const isIPRangeValid = await this.isIPRangeValid(ip);
      if (!isIPRangeValid) return;

      if (!this.isValidWebhookPayload(payload)) {
        this.logger.warn('Invalid webhook payload structure');
        return;
      }
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
      if (isProd) {
        const status = await this.yooKassaProvider.checkPaymentStatus(paymentId);
        if (status !== webhookStatus) {
          this.logger.warn(
            `Payment ${paymentId} status mismatch! Webhook: ${webhookStatus}, API: ${status}. Possible fake webhook.`,
          );
          return;
        }
      }

      if (event === PAYMENT_EVENTS.SUCCEEDED) {
        await this.handlePaymentSucceeded(payload);
      }
    } catch (apiError) {
      this.logger.error(`API verification failed for payment ${paymentId}`, apiError);
    }
  }

  private async handlePaymentSucceeded(payload: YookassaWebhookPayload): Promise<void> {
    const { metadata, payment_method, id } = payload.object;

    const telegramId = Number(metadata.telegramId);
    const selectedPeriod = Number(metadata.selectedPeriod);

    await this.yookassaPaymentRepo.update(id, {
      status: 'success',
      paidAt: new Date(),
      url: null,
    });

    if (!telegramId) {
      this.logger.warn('Invalid telegramId in Yookassa metadata');
    }

    // Save payment method if YooKassa reports it as saved
    if (payment_method?.saved && payment_method.id) {
      await this.trySavePaymentMethod(String(telegramId), payment_method);
    }

    const result = await this.paymentStatusService.handlePaymentSucceeded(
      telegramId,
      selectedPeriod,
    );

    if (result.userId) {
      this.eventEmitter.emit(PAYMENT_EVENTS.SUCCEEDED, {
        telegramId,
        provider: 'yookassa',
        selectedPeriod,
      } satisfies PaymentSucceededEvent);
    }
  }

  /**
   * Persists a saved payment method from YooKassa's webhook response.
   * Idempotent: if paymentMethodId already exists, it's left as-is.
   *
   * Respects user opt-out: if the user has previously disabled all their saved
   * methods (opted out of autopayments), we do NOT save or reactivate anything.
   */
  private async trySavePaymentMethod(
    userId: string,
    paymentMethod: NonNullable<YookassaPaymentPayload['payment_method']>,
  ): Promise<void> {
    try {
      // Check if user has opted out (has records but none active)
      if (await this.hasUserOptedOutOfAutopayments(userId)) {
        this.logger.log(
          `Skipping payment method save for user ${userId} — user opted out of autopayments`,
        );
        return;
      }

      const existing = await this.savedMethodRepo.findOneBy({
        paymentMethodId: paymentMethod.id,
      });

      if (existing) {
        // Method already tracked — do not reactivate if user disabled it
        return;
      }

      const method = this.savedMethodRepo.create({
        userId,
        provider: 'yookassa',
        paymentMethodId: paymentMethod.id,
        paymentMethodType: paymentMethod.type,
        title: paymentMethod.title ?? null,
        card: paymentMethod.card
          ? {
              last4: paymentMethod.card.last4,
              expiryMonth: paymentMethod.card.expiry_month,
              expiryYear: paymentMethod.card.expiry_year,
              cardType: paymentMethod.card.card_type,
              first6: paymentMethod.card.first6,
              issuerCountry: paymentMethod.card.issuer_country,
            }
          : null,
        isActive: true,
      });

      await this.savedMethodRepo.save(method);

      this.eventEmitter.emit(PAYMENT_EVENTS.METHOD_SAVED, {
        telegramId: Number(userId),
        provider: 'yookassa',
        paymentMethodType: paymentMethod.type,
        title: paymentMethod.title,
      });

      this.logger.log(
        `Saved payment method ${paymentMethod.id} (${paymentMethod.type}) for user ${userId}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to save payment method for user ${userId}: ${err.message}`);
    }
  }

  /**
   * User has opted out if they have saved method records but all are inactive.
   * No records at all = new user = NOT opted out.
   */
  private async hasUserOptedOutOfAutopayments(userId: string): Promise<boolean> {
    const totalCount = await this.savedMethodRepo.count({
      where: { userId, provider: 'yookassa' },
    });

    if (totalCount === 0) return false;

    const activeCount = await this.savedMethodRepo.count({
      where: { userId, provider: 'yookassa', isActive: true },
    });

    return activeCount === 0;
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
