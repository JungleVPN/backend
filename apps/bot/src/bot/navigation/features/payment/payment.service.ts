import { BotContext } from '@bot/bot.types';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CurrencyService } from '@payments/currency-service/currency.service';

@Injectable()
export class PaymentMsgService extends Base {
  constructor(
    readonly currencyService: CurrencyService,
    @Inject(forwardRef(() => PaymentMenu))
    readonly paymentMenu: PaymentMenu,
  ) {
    super();
  }

  async init(ctx: BotContext) {
    const session = ctx.session;
    const { selectedPeriod = 'month_1', selectedProvider } = session;

    if (!selectedPeriod || !selectedProvider) {
      await ctx.reply(ctx.t('error-generic-restart'));
      return;
    }

    const { amount, currency } = this.currencyService.getPriceForPeriod(
      selectedPeriod,
      selectedProvider,
    );

    const content = ctx.t('payment-text', {
      amount,
      period: ctx.t(`period-${selectedPeriod}`),
      currency: currency === 'EUR' ? '€' : '₽',
    });

    await this.render(ctx, content, this.paymentMenu.menu);
  }
}
