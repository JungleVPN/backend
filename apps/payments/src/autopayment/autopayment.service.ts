import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { BotNotificationService } from '@payments/notifications/bot-notification.service';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { Payments, RemnawebhookPayload, WebhookEventEnum } from '@workspace/types';
import { Repository } from 'typeorm';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

@Injectable()
export class AutopaymentService {
  private readonly logger = new Logger(AutopaymentService.name);

  constructor(
    @InjectRepository(SavedPaymentMethod)
    private readonly savedMethodRepo: Repository<SavedPaymentMethod>,
    @InjectRepository(YookassaPayment)
    private readonly yookassaPaymentRepo: Repository<YookassaPayment>,
    private readonly yookassaProvider: YooKassaProvider,
    private readonly eventEmitter: EventEmitter2,
    private readonly botNotificationService: BotNotificationService,
  ) {}

  private get autopaymentAmount(): number {
    return Number(process.env.AUTOPAYMENT_AMOUNT || '200');
  }

  private get autopaymentPeriod(): number {
    return Number(process.env.AUTOPAYMENT_PERIOD || '1');
  }

  async init(payload: RemnawebhookPayload): Promise<void> {
    const userId = payload.data.uuid;
    const telegramId = payload.data.telegramId;

    if (!telegramId) {
      this.logger.warn('user.expires_in_24_hours event with no telegramId, skipping');
      return;
    }

    this.logger.log(`User ${telegramId} expires in 24h — checking saved payment methods`);

    const savedMethod = await this.savedMethodRepo.findOneBy({
      userId,
      isActive: true,
    });

    if (!savedMethod) {
      this.logger.log(
        `No active saved payment method for user ${telegramId} — notifying bot for manual payment`,
      );
      await this.botNotificationService.notify('payment.no_active_method', {
        telegramId,
        provider: 'yookassa',
        reason: 'no_active_method',
      });
      return;
    }

    await this.attemptAutopaymentWithRetries({
      userId,
      paymentMethodId: savedMethod.paymentMethodId,
    });
  }

  private async attemptAutopaymentWithRetries({
    telegramId,
    userId,
    paymentMethodId,
  }: {
    userId: string;
    paymentMethodId: string;
    telegramId?: number;
  }): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      this.logger.log(`Autopayment attempt ${attempt}/${MAX_RETRIES} for user ${userId}`);

      try {
        const result = await this.executeAutopayment({ userId, paymentMethodId });

        if (result.status === 'succeeded') {
          this.logger.log(`Autopayment succeeded for user ${userId} (attempt ${attempt})`);
          return;
        }

        // Payment processed but failed (e.g. canceled by bank)
        this.logger.warn(
          `Autopayment attempt ${attempt} for user ${userId}: status=${result.status}` +
            (result.cancellation_details ? ` reason=${result.cancellation_details.reason}` : ''),
        );
      } catch (err: any) {
        this.logger.error(
          `Autopayment attempt ${attempt} for user ${userId} failed: ${err.message}`,
        );
      }

      if (attempt < MAX_RETRIES) {
        await this.delay(RETRY_DELAY_MS);
      }
    }

    this.logger.warn(
      `All ${MAX_RETRIES} autopayment attempts failed for user ${telegramId} — falling back to manual payment`,
    );
    await this.botNotificationService.notify('payment.autopayment_exhausted', {
      telegramId: telegramId ?? null,
      provider: 'yookassa',
      reason: 'autopayment_exhausted',
    });
  }

  /**
   * Execute a single autopayment attempt.
   * Creates the payment via YooKassa, persists the record, and emits failure events.
   */
  private async executeAutopayment({
    telegramId,
    userId,
    paymentMethodId,
  }: {
    userId: string;
    paymentMethodId: string;
    telegramId?: number;
  }): Promise<Payments.IPayment> {
    const amount = this.autopaymentAmount;
    const selectedPeriod = this.autopaymentPeriod;
    const description = process.env.PAYMENT_DESCRIPTION || 'Happy to see you in the JUNGLE 🌴';

    if (!telegramId) {
      this.logger.warn(`Executing autopayment for user ${userId} with no telegramId`);
    }

    const request: Payments.CreatePaymentRequest = {
      amount: { value: String(amount), currency: 'RUB' },
      capture: true,
      payment_method_id: paymentMethodId,
      description,
    };

    const payment = await this.yookassaProvider.create(request);

    const record = this.yookassaPaymentRepo.create({
      id: payment.id,
      status: payment.status,
      amount,
      userId,
      selectedPeriod,
      telegramId: telegramId ?? null,
      description,
      paidAt: payment.status === 'succeeded' ? new Date() : null,
    });
    await this.yookassaPaymentRepo.save(record);

    if (payment.status === 'canceled' && payment.cancellation_details) {
      this.eventEmitter.emit(WebhookEventEnum['payment.autopayment_failed'], {
        telegramId: telegramId ?? null,
        provider: 'yookassa',
        reason: payment.cancellation_details.reason,
      } satisfies Payments.PaymentFailedEventPayload);
    }

    return payment;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
