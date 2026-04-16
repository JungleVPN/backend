import * as process from 'node:process';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { AutopaymentService } from '@payments/autopayment/autopayment.service';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import {
  type IGeneralPayMethod,
  type IPaymentMethod,
  isBankCardPaymentMethod,
  isSavablePaymentMethod,
  Payments,
  type PaymentWebhookNotification,
  WebhookEvent,
  WebhookEventEnum,
} from '@workspace/types';
import { Repository } from 'typeorm';
import { PaymentStatusService } from '../../payment-status/payment-status.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const CIDRMatcher = require('cidr-matcher');

@Injectable()
export class YookassaService {
  private readonly logger = new Logger(YookassaService.name);
  private readonly validIpAddresses: string[] = JSON.parse(
    process.env.YOOKASSA_PAYMENT_VALID_IP_ADDRESS || '[]',
  );

  constructor(
    private readonly yooKassaProvider: YooKassaProvider,
    @InjectRepository(YookassaPayment)
    private readonly yookassaPaymentRepo: Repository<YookassaPayment>,
    @InjectRepository(SavedPaymentMethod)
    private readonly savedMethodRepo: Repository<SavedPaymentMethod>,
    private readonly paymentStatusService: PaymentStatusService,
    private readonly eventEmitter: EventEmitter2,
    private readonly autopaymentService: AutopaymentService,
  ) {}

  async handleWebhook(payload: PaymentWebhookNotification, ip: string) {
    const isProd = process.env.NODE_ENV === 'production';
    if (isProd) {
      await this.validateWebhookPayload(payload, ip);
    }

    try {
      switch (payload.event) {
        case WebhookEventEnum['payment.succeeded']:
          await this.handlePaymentSucceeded(payload);
          break;
        case WebhookEventEnum['payment.canceled']:
          await this.handlePaymentCanceled(payload);
          break;
      }
    } catch (apiError) {
      this.logger.error(`API verification failed for payment ${payload.object.id}`, apiError);
    }
  }

  async handlePaymentSucceeded(payload: PaymentWebhookNotification): Promise<void> {
    const { metadata, payment_method, id, status, captured_at } = payload.object;

    const telegramId = Number(metadata?.telegramId);
    const selectedPeriod = Number(metadata?.selectedPeriod);

    await this.yookassaPaymentRepo.update(id, {
      status,
      paidAt: captured_at ? new Date(captured_at) : new Date(),
      url: null,
    });

    if (!telegramId) {
      this.logger.warn('Invalid telegramId in Yookassa metadata');
    }

    const result = await this.paymentStatusService.handlePaymentSucceeded(
      telegramId,
      selectedPeriod,
    );

    if (result.success) {
      await this.autopaymentService.disableActiveMethodIfExists(String(telegramId));

      this.eventEmitter.emit(WebhookEventEnum['payment.succeeded'], {
        telegramId,
        provider: 'yookassa',
        selectedPeriod,
      } satisfies Payments.PaymentSucceededEventPayload);
    }

    // Persist payment method if YooKassa reports it as saved
    if (payment_method && isSavablePaymentMethod(payment_method) && payment_method.saved) {
      await this.trySavePaymentMethod(String(telegramId), payment_method);
    }
  }

  async handlePaymentCanceled(payload: PaymentWebhookNotification): Promise<void> {
    const { metadata, id, status, cancellation_details } = payload.object;

    const telegramId = Number(metadata?.telegramId);
    const selectedPeriod = Number(metadata?.selectedPeriod);

    await this.yookassaPaymentRepo.update(id, {
      status,
      url: null,
    });

    if (cancellation_details) {
      this.eventEmitter.emit(WebhookEventEnum['payment.canceled'], {
        telegramId,
        provider: 'yookassa',
        selectedPeriod,
        reason: cancellation_details.reason,
      } satisfies Payments.PaymentFailedEventPayload);
    }
  }

  async deletePaymentMethod(id: string, userId: string): Promise<void> {
    const method = await this.savedMethodRepo.findOneBy({ id, userId });
    if (!method) {
      throw new NotFoundException(`Saved payment method ${id} not found for user ${userId}`);
    }

    await this.savedMethodRepo.delete({ id, userId });
    this.logger.log(`Deleted saved payment method ${id} for user ${userId}`);
  }
  /**
   * Persists a saved payment method from YooKassa's webhook payload.
   *
   * Idempotent: if `paymentMethodId` already exists, nothing is written.
   * Respects user opt-out: if the user has previously disabled all saved
   * methods, we do NOT re-save. Errors are swallowed — saving is best-effort
   * and must not block webhook processing.
   */
  private async trySavePaymentMethod(
    userId: string,
    paymentMethod: IPaymentMethod & IGeneralPayMethod,
  ): Promise<void> {
    try {
      const existing = await this.savedMethodRepo.findOneBy({
        paymentMethodId: paymentMethod.id,
      });
      if (existing) {
        await this.deletePaymentMethod(existing.id, existing.userId);
      }

      const card = isBankCardPaymentMethod(paymentMethod) ? paymentMethod.card : undefined;

      const method = this.savedMethodRepo.create({
        userId,
        provider: 'yookassa',
        paymentMethodId: paymentMethod.id,
        paymentMethodType: paymentMethod.type,
        title: paymentMethod.title ?? null,
        card: card
          ? {
              last4: card.last4,
              expiryMonth: card.expiry_month,
              expiryYear: card.expiry_year,
              cardType: card.card_type,
              first6: card.first6,
              issuerCountry: card.issuer_country,
            }
          : null,
        isActive: true,
      });
      console.log(method);
      await this.savedMethodRepo.save(method);

      this.logger.log(
        `Saved payment method ${paymentMethod.id} (${paymentMethod.type}) for user ${userId}`,
      );
    } catch (err: any) {
      this.logger.error(`Failed to save payment method for user ${userId}: ${err.message}`);
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

  isValidNotificationEvent(event: string): event is WebhookEvent {
    return ['payment.succeeded', 'payment.canceled', 'payment.waiting_for_capture'].includes(event);
  }

  isValidWebhookPayload(payload: PaymentWebhookNotification): boolean {
    return (
      !!payload.object &&
      payload.type === 'notification' &&
      this.isValidNotificationEvent(payload.event)
    );
  }

  async validateWebhookPayload(payload: PaymentWebhookNotification, ip: string) {
    const { paymentId, status: webhookStatus } = {
      paymentId: payload.object.id,
      status: payload.object.status,
    };

    const isIPRangeValid = await this.isIPRangeValid(ip);
    if (!isIPRangeValid) return;

    if (!this.isValidWebhookPayload(payload)) {
      this.logger.warn('Invalid webhook payload structure');
      return;
    }

    const { status } = await this.yooKassaProvider.getPayment(paymentId);
    if (status !== webhookStatus) {
      this.logger.warn(
        `Payment ${paymentId} status mismatch! Webhook: ${webhookStatus}, API: ${status}. Possible fake webhook.`,
      );
      return;
    }
  }
}
