import { BotContext } from '@bot/bot.types';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { PaymentPeriod } from '@shared/payments';
import { Bot } from 'grammy';

@Injectable()
export class PaymentPeriodsCallback extends Base {
  constructor(readonly paymentMethodMenu: PaymentMethodMenu) {
    super();
  }

  register(bot: Bot<BotContext>) {
    bot.callbackQuery(
      ['payment_for_month_1', 'payment_for_month_3', 'payment_for_month_6'],
      async (ctx) => {
        ctx.session.selectedPeriod = ctx.callbackQuery.data.replace(
          'payment_for_',
          '',
        ) as PaymentPeriod;
        await this.render(ctx, ctx.t('payment-methods-text'), this.paymentMethodMenu.menu);
        await ctx.answerCallbackQuery();
      },
    );
  }
}
