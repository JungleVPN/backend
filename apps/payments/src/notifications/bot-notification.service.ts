import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Payments, WebhookEvent, WebhookEventEnum } from '@workspace/types';
import axios from 'axios';

/**
 * Listens for payment events and dispatches notifications to external receivers.
 *
 * Currently notifies the bot via HTTP.
 * Extensible: add more @OnEvent handlers or receiver methods (e.g. email)
 * without touching the webhook services that emit events.
 */
@Injectable()
export class BotNotificationService {
  private readonly logger = new Logger(BotNotificationService.name);

  private get botBaseUrl(): string {
    return process.env.BOT_URL || 'http://localhost:7080';
  }

  private get botNotifySecret(): string {
    return process.env.BOT_NOTIFY_SECRET || '';
  }

  @OnEvent(WebhookEventEnum['payment.succeeded'])
  async onPaymentSucceeded(event: Payments.PaymentSucceededEventPayload): Promise<void> {
    await this.notify('payment.succeeded', event);
  }

  @OnEvent(WebhookEventEnum['payment.autopayment_failed'])
  async onAutopaymentFailed(event: Payments.PaymentSucceededEventPayload): Promise<void> {
    await this.notify('payment.autopayment_failed', event);
  }

  @OnEvent(WebhookEventEnum['payment.canceled'])
  async onCancel(event: Payments.PaymentSucceededEventPayload): Promise<void> {
    await this.notify('payment.canceled', event);
  }

  /**
   * Sends payment notification to the bot's /notify/payment endpoint.
   * Best-effort: failures are logged but do not affect payment processing.
   */
  public async notify(
    eventType: WebhookEvent,
    payload: Payments.PaymentSucceededEventPayload | Payments.PaymentFailedEventPayload,
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
