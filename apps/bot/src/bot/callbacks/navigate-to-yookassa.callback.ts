import { BotContext } from '@bot/bot.types';
import { PaymentMethodMsgService } from '@bot/navigation/features/payment/payment-method/payment-method.service';
import { Base } from '@bot/navigation/menu.base';
import { Injectable } from '@nestjs/common';
import { Bot } from 'grammy';

/**
 * Bypasses the payment-method selection menu and goes straight to a
 * YooKassa checkout session.
 */
@Injectable()
export class NavigateToYookassaPaymentCallback extends Base {
  constructor(readonly paymentMethodMsgService: PaymentMethodMsgService) {
    super();
  }

  register(bot: Bot<BotContext>) {
    bot.callbackQuery('navigate_to_yookassa_payment', async (ctx) => {
      await ctx.answerCallbackQuery();
      ctx.session.selectedProvider = 'yookassa';
      await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'yookassa');
    });
  }
}
