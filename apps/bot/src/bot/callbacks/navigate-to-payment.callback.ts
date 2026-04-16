import { BotContext } from '@bot/bot.types';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

/**
 * Navigates the user to the payment-method selection menu.
 */
@Injectable()
export class NavigateToPaymentCallback extends Base {
  constructor(readonly paymentMethodMenu: PaymentMethodMenu) {
    super();
  }

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_to_payment', async (ctx) => {
      await ctx.answerCallbackQuery();
      await this.render(ctx, ctx.t('payment-methods-text'), this.paymentMethodMenu.menu);
    });
  }
}
