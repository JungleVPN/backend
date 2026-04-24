import * as process from 'node:process';
import { BotService } from '@bot/bot.service';
import { BotContext } from '@bot/bot.types';
import { LocalisationService } from '@bot/localisation/localisation.service';
import { safeSendMessage, toDateString } from '@bot/utils/utils';
import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Payments } from '@shared/payments';
import { Bot, InlineKeyboard } from 'grammy';

/**
 * Payload delivered by the backend to `/notify/payment` and re-emitted
 * internally as `notify.payment.canceled`.
 *
 * Mirrors `Payments.PaymentFailedEventPayload` plus the transport fields
 * added by the bot's webhook controller (`event`, `locale`).
 */
type PaymentCanceledNotification = Payments.PaymentFailedEventPayload & {
  event: 'payment.canceled';
  locale?: string;
  reason?: Payments.CancelReason | string;
};

/**
 * Mapping from YooKassa `CancelReason` to the localisation key we show the
 * user. Reasons are grouped by what action the user is expected to take so
 * we don't end up with 20 near-identical translation strings.
 */
const CANCEL_REASON_I18N_KEY: Record<Payments.CancelReason, string> = {
  insufficient_funds: 'invoice-payment-failed-insufficient-funds-text',
  card_expired: 'invoice-payment-failed-card-expired-text',
  invalid_card_number: 'invoice-payment-failed-invalid-card-text',
  invalid_csc: 'invoice-payment-failed-invalid-card-text',
  '3d_secure_failed': 'invoice-payment-failed-3ds-text',
  fraud_suspected: 'invoice-payment-failed-fraud-text',
  call_issuer: 'invoice-payment-failed-issuer-text',
  issuer_unavailable: 'invoice-payment-failed-issuer-text',
  payment_method_restricted: 'invoice-payment-failed-issuer-text',
  payment_method_limit_exceeded: 'invoice-payment-failed-limit-text',
  country_forbidden: 'invoice-payment-failed-country-text',
  unsupported_mobile_operator: 'invoice-payment-failed-country-text',
  identification_required: 'invoice-payment-failed-identification-text',
  expired_on_capture: 'invoice-payment-failed-expired-text',
  expired_on_confirmation: 'invoice-payment-failed-expired-text',
  deal_expired: 'invoice-payment-failed-expired-text',
  internal_timeout: 'invoice-payment-failed-timeout-text',
  permission_revoked: 'invoice-payment-failed-permission-revoked-text',
  canceled_by_merchant: 'invoice-payment-failed-text',
  general_decline: 'invoice-payment-failed-text',
};

/** Generic fallback used for unknown / missing reasons. */
const DEFAULT_FAILURE_I18N_KEY = 'invoice-payment-failed-text';

/**
 * Handles payment notifications from the backend.
 * All business logic (subscription updates, referral rewards) is handled by the backend.
 * This listener only sends Telegram messages to the user.
 */
@Injectable()
export class PaymentStatusListener {
  bot: Bot<BotContext>;
  logger = new Logger(PaymentStatusListener.name);

  constructor(
    private readonly botService: BotService,
    private readonly localService: LocalisationService,
  ) {
    this.bot = this.botService.bot;
  }

  @OnEvent('notify.payment.succeeded')
  async handlePaymentSucceeded(payload: {
    event: string;
    telegramId: number;
    provider: 'stripe' | 'yookassa';
    locale: string;
    expireAt?: string;
    invoiceUrl?: string;
    subscriptionUrl?: string;
  }) {
    const {
      telegramId,
      provider,
      locale: rawLocale,
      expireAt,
      invoiceUrl,
      subscriptionUrl,
    } = payload;
    const locale = rawLocale || process.env.DEFAULT_LOCALE || 'en';

    if (provider === 'stripe' && expireAt) {
      await this.sendStripeSuccessMessage(
        telegramId,
        locale,
        expireAt,
        invoiceUrl,
        subscriptionUrl,
      );
    } else {
      await this.sendYookassaSuccessMessage(telegramId, locale);
    }
  }

  @OnEvent('notify.payment.no_active_method')
  handleNoActiveMethod(payload: PaymentCanceledNotification): Promise<void> {
    return this.commonPaymentFailed(payload);
  }
  @OnEvent('notify.payment.canceled')
  handlePaymentCanceled(payload: PaymentCanceledNotification): Promise<void> {
    return this.commonPaymentFailed(payload);
  }

  async commonPaymentFailed(payload: PaymentCanceledNotification): Promise<void> {
    const { telegramId, locale: rawLocale, reason } = payload;
    const locale = rawLocale || process.env.DEFAULT_LOCALE || 'en';
    const i18n = this.localService.i18n;

    const i18nKey = this.resolveFailureI18nKey(reason);

    this.logger.log(`Notifying telegramId=${telegramId}, reason=${reason ?? 'unknown'}`);

    const text = i18n.t(locale, i18nKey);
    const menu = new InlineKeyboard()
      .text(i18n.t(locale, 'pay-button-label'), 'navigate_to_payment')
      .row()
      .text(i18n.t(locale, 'profile-button-label'), 'navigate_to_profile');

    await safeSendMessage(this.bot, telegramId, text, {
      reply_markup: menu,
      parse_mode: 'HTML',
    });
  }

  /**
   * Resolves the localisation key for a given cancellation reason, falling back
   * to the generic failure message for unknown or missing values.
   */
  private resolveFailureI18nKey(reason?: Payments.CancelReason | string): string {
    if (!reason) return DEFAULT_FAILURE_I18N_KEY;
    return CANCEL_REASON_I18N_KEY[reason as Payments.CancelReason] ?? DEFAULT_FAILURE_I18N_KEY;
  }

  private async sendYookassaSuccessMessage(telegramId: number, locale: string) {
    const i18n = this.localService.i18n;

    const successMenu = new InlineKeyboard()
      .text(i18n.t(locale, 'profile-button-label'), 'navigate_to_profile')
      .row()
      .text(i18n.t(locale, 'home-button-label'), 'navigate_main');

    await safeSendMessage(this.bot, telegramId, i18n.t(locale, 'payment-success-text'), {
      reply_markup: successMenu,
    });
  }

  private async sendStripeSuccessMessage(
    telegramId: number,
    locale: string,
    expireAt: string,
    invoiceUrl?: string,
    subscriptionUrl?: string,
  ) {
    const i18n = this.localService.i18n;
    const formattedDate = toDateString(expireAt);

    const text = i18n.t(locale, 'invoice-payment-success-text', {
      expireAt: formattedDate,
    });

    const successMenu = new InlineKeyboard()
      .text(i18n.t(locale, 'profile-button-label'), 'navigate_to_profile')
      .url(i18n.t(locale, 'invoice-button-label'), invoiceUrl || subscriptionUrl || '#')
      .row()
      .text(i18n.t(locale, 'home-button-label'), 'navigate_main');

    await safeSendMessage(this.bot, telegramId, text, {
      reply_markup: successMenu,
      parse_mode: 'HTML',
    });
  }
}
