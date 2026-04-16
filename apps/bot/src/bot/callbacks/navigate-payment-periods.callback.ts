import { BotContext } from '@bot/bot.types';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

@Injectable()
export class NavigatePaymentPeriodsCallback extends Base {
  constructor(readonly paymentsPeriodsMenu: PaymentsPeriodsMenu) {
    super();
  }

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_payment_periods', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.render(ctx, ctx.t('payment-periods-text'), this.paymentsPeriodsMenu.menu);
    });
  }
}
