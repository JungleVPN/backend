import { BotContext } from '@bot/bot.types';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { Base } from '@bot/navigation/menu.base';
import { mapPeriodToMonthsNumber } from '@bot/utils/utils';
import { Injectable } from '@nestjs/common';
import { CurrencyService } from '@payments/currency-service/currency.service';
import { PaymentsService } from '@payments/payments.service';
import { RemnaService } from '@remna/remna.service';
import { PaymentProvider, PaymentSession } from '@shared/payments';

@Injectable()
export class PaymentMethodMsgService extends Base {
  constructor(
    readonly remnaService: RemnaService,
    readonly paymentsService: PaymentsService,
    readonly paymentMsgService: PaymentMsgService,
    readonly currencyService: CurrencyService,
  ) {
    super();
  }

  async handlePaymentMethod(ctx: BotContext, provider: PaymentProvider) {
    const session = ctx.session;
    const tgUser = this.validateUser(ctx.from);
    const user = await this.remnaService.getUserByTgId(tgUser.id);
    const { selectedPeriod = 'month_1' } = session;

    if (!user || !selectedPeriod) {
      await ctx.reply(ctx.t('error-generic-restart'));
      return;
    }

    const { amount, currency } = this.currencyService.getPriceForPeriod(selectedPeriod, provider);
    const selectedMonths = mapPeriodToMonthsNumber(selectedPeriod);

    const paymentSession = await this.createSessionForProvider(provider, {
      userId: tgUser.id.toString(),
      amount,
      currency,
      description: ctx.t('provider-description-text'),
      selectedPeriod: selectedMonths,
      telegramMessageId: ctx.msg?.message_id,
      telegramId: tgUser.id.toString(),
    });

    ctx.session.paymentUrl = paymentSession.url;

    await this.paymentMsgService.init(ctx);
  }

  private async createSessionForProvider(
    provider: PaymentProvider,
    params: {
      userId: string;
      amount: number | string;
      currency: string;
      description: string;
      selectedPeriod: number;
      telegramMessageId?: number;
      telegramId: string;
    },
  ): Promise<PaymentSession> {
    const metadata = {
      description: params.description,
      selectedPeriod: params.selectedPeriod,
      telegramMessageId: params.telegramMessageId,
      telegramId: params.telegramId,
    };

    switch (provider) {
      case 'stripe':
        return this.paymentsService.createStripeSession({
          userId: params.userId,
          payment: {
            amount: params.amount,
            currency: 'EUR',
          },
          metadata,
        });

      case 'yookassa':
        return this.paymentsService.createYookassaSession({
          userId: params.userId,
          paymentDto: {
            amount: {
              value: params.amount.toString(),
              currency: params.currency,
            },
            description: params.description,
            status: 'pending',
            metadata,
          },
          save_payment_method: true,
        });
    }
  }
}
