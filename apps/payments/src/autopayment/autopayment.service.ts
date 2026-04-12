import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import type { AutopaymentResult, RemnawebhookPayload } from '@workspace/types';
import axios from 'axios';
import { Repository } from 'typeorm';
import { type AutopaymentFailedEvent, PAYMENT_EVENTS } from '../notifications/payment-events';

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
  ) {}

  private get botBaseUrl(): string {
    return process.env.BOT_URL || 'http://localhost:7080';
  }

  private get botNotifySecret(): string {
    return process.env.BOT_NOTIFY_SECRET || '';
  }

  private get autopaymentAmount(): number {
    return Number(process.env.AUTOPAYMENT_AMOUNT || '200');
  }

  private get autopaymentPeriod(): number {
    return Number(process.env.AUTOPAYMENT_PERIOD || '1');
  }

  async handleUserExpiresIn24h(payload: RemnawebhookPayload): Promise<void> {
    const telegramId = payload.data.telegramId;

    if (!telegramId) {
      this.logger.warn('user.expires_in_24_hours event with no telegramId, skipping');
      return;
    }

    this.logger.log(`User ${telegramId} expires in 24h — checking saved payment methods`);

    const savedMethod = await this.savedMethodRepo.findOneBy({
      userId: String(telegramId),
      isActive: true,
    });

    if (!savedMethod) {
      this.logger.log(
        `No active saved payment method for user ${telegramId} — notifying bot for manual payment`,
      );
      await this.notifyBotManualPayment(telegramId);
      return;
    }

    await this.attemptAutopaymentWithRetries(telegramId, savedMethod.paymentMethodId);
  }

  private async attemptAutopaymentWithRetries(
    telegramId: number,
    paymentMethodId: string,
  ): Promise<void> {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      this.logger.log(`Autopayment attempt ${attempt}/${MAX_RETRIES} for user ${telegramId}`);

      try {
        const result = await this.executeAutopayment(telegramId, paymentMethodId);

        if (result.status === 'succeeded') {
          this.logger.log(`Autopayment succeeded for user ${telegramId} (attempt ${attempt})`);
          return;
        }

        // Payment processed but failed (e.g. canceled by bank)
        this.logger.warn(
          `Autopayment attempt ${attempt} for user ${telegramId}: status=${result.status}` +
            (result.cancellationDetails ? ` reason=${result.cancellationDetails.reason}` : ''),
        );
      } catch (err: any) {
        this.logger.error(
          `Autopayment attempt ${attempt} for user ${telegramId} failed: ${err.message}`,
        );
      }

      if (attempt < MAX_RETRIES) {
        await this.delay(RETRY_DELAY_MS);
      }
    }

    this.logger.warn(
      `All ${MAX_RETRIES} autopayment attempts failed for user ${telegramId} — falling back to manual payment`,
    );
    await this.notifyBotManualPayment(telegramId);
  }

  /**
   * Execute a single autopayment attempt.
   * Creates the payment via YooKassa, persists the record, and emits failure events.
   */
  private async executeAutopayment(
    telegramId: number,
    paymentMethodId: string,
  ): Promise<AutopaymentResult> {
    const userId = String(telegramId);
    const amount = this.autopaymentAmount;
    const selectedPeriod = this.autopaymentPeriod;

    const apiResult = await this.yookassaProvider.createAutopayment({
      userId,
      paymentMethodId,
      amount,
      selectedPeriod,
      description: process.env.PAYMENT_DESCRIPTION || 'Happy to see you in the JUNGLE 🌴',
    });

    const record = this.yookassaPaymentRepo.create({
      id: apiResult.id,
      status: apiResult.status,
      amount,
      userId,
      description: process.env.PAYMENT_DESCRIPTION || 'Happy to see you in the JUNGLE 🌴',
      metadata: { telegramId: userId, selectedPeriod, isAutopayment: true },
      paidAt: apiResult.status === 'succeeded' ? new Date() : null,
    });
    await this.yookassaPaymentRepo.save(record);

    if (apiResult.status === 'canceled' && apiResult.cancellation_details) {
      this.eventEmitter.emit(PAYMENT_EVENTS.AUTOPAYMENT_FAILED, {
        telegramId,
        provider: 'yookassa',
        selectedPeriod,
        reason: apiResult.cancellation_details.reason,
        party: apiResult.cancellation_details.party,
      } satisfies AutopaymentFailedEvent);
    }

    return {
      paymentId: apiResult.id,
      status: apiResult.status,
      cancellationDetails: apiResult.cancellation_details,
    };
  }

  /**
   * Notify the bot that autopayment is not available for this user,
   * so the bot can prompt them with a manual payment link.
   */
  private async notifyBotManualPayment(telegramId: number): Promise<void> {
    try {
      await axios.post(
        `${this.botBaseUrl}/notify/payment`,
        {
          event: 'payment.autopayment_exhausted',
          telegramId,
          provider: 'yookassa',
          selectedPeriod: this.autopaymentPeriod,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': this.botNotifySecret,
          },
          timeout: 5_000,
        },
      );
      this.logger.log(`Bot notified: manual payment needed for user ${telegramId}`);
    } catch (err: any) {
      this.logger.warn(
        `Failed to notify bot about manual payment for user ${telegramId}: ${err.message}`,
      );
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
