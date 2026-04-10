import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import axios from 'axios';
import type {
  AutopaymentFailedEvent,
  PaymentMethodSavedEvent,
  PaymentSucceededEvent,
} from './payment-events';
import { PAYMENT_EVENTS } from './payment-events';

/**
 * Listens for payment events and dispatches notifications to external receivers.
 *
 * Currently notifies the bot via HTTP.
 * Extensible: add more @OnEvent handlers or receiver methods (e.g. email)
 * without touching the webhook services that emit events.
 */
@Injectable()
export class PaymentNotificationService {
  private readonly logger = new Logger(PaymentNotificationService.name);

  private get botBaseUrl(): string {
    return process.env.BOT_URL || 'http://localhost:7080';
  }

  private get botNotifySecret(): string {
    return process.env.BOT_NOTIFY_SECRET || '';
  }

  @OnEvent(PAYMENT_EVENTS.SUCCEEDED)
  async onPaymentSucceeded(event: PaymentSucceededEvent): Promise<void> {
    await this.notifyBot(PAYMENT_EVENTS.SUCCEEDED, event);
  }

  @OnEvent(PAYMENT_EVENTS.METHOD_SAVED)
  async onMethodSaved(event: PaymentMethodSavedEvent): Promise<void> {
    await this.notifyBot(PAYMENT_EVENTS.METHOD_SAVED, event);
  }

  @OnEvent(PAYMENT_EVENTS.AUTOPAYMENT_FAILED)
  async onAutopaymentFailed(event: AutopaymentFailedEvent): Promise<void> {
    await this.notifyBot(PAYMENT_EVENTS.AUTOPAYMENT_FAILED, event);
  }

  /**
   * Sends payment notification to the bot's /notify/payment endpoint.
   * Best-effort: failures are logged but do not affect payment processing.
   */
  private async notifyBot(
    eventType: string,
    payload: PaymentSucceededEvent | PaymentMethodSavedEvent | AutopaymentFailedEvent,
  ): Promise<void> {
    try {
      await axios.post(
        `${this.botBaseUrl}/notify/payment`,
        {
          event: eventType,
          ...payload,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': this.botNotifySecret,
          },
          timeout: 5_000,
        },
      );

      this.logger.log(`Bot notified: ${eventType} for telegramId=${payload.telegramId}`);
    } catch (err: any) {
      this.logger.warn(
        `Failed to notify bot about ${eventType} for telegramId=${payload.telegramId}: ${err.message}`,
      );
    }
  }
}
