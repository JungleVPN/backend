import { Menu } from '@bot/navigation';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentMenu extends Base implements OnModuleInit {
  menu = new Menu('payment-menu');

  constructor(
    @Inject(forwardRef(() => PaymentMethodMenu))
    readonly paymentMethodMenu: PaymentMethodMenu,
  ) {
    super();
  }

  onModuleInit() {
    this.menu
      .url(
        (ctx) => ctx.t('pay-button-label'),
        (ctx) => {
          return ctx.session.paymentUrl || 'https://example.com';
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('back-button-label'),
        async (ctx) =>
          await this.render(ctx, ctx.t('payment-methods-text'), this.paymentMethodMenu.menu),
      );
  }
}
