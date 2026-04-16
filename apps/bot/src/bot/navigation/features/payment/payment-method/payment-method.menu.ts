import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { PaymentMethodMsgService } from '@bot/navigation/features/payment/payment-method/payment-method.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentMethodMenu extends Base implements OnModuleInit {
  menu = new Menu('payment-methods-menu');

  constructor(
    readonly paymentMethodMsgService: PaymentMethodMsgService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    readonly mainMenuService: MainMenuService,
  ) {
    super();
  }

  onModuleInit() {
    this.menu
      .text(
        (ctx) => ctx.t('payment-method-eur'),
        async (ctx) => {
          ctx.session.selectedProvider = 'stripe';
          await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'stripe');
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('payment-method-rub'),
        async (ctx) => {
          ctx.session.selectedProvider = 'yookassa';
          await this.paymentMethodMsgService.handlePaymentMethod(ctx, 'yookassa');
        },
      )
      .row()
      .text(
        (ctx) => ctx.t('back-button-label'),
        async (ctx) => await this.mainMenuService.init(ctx, this.mainMenu.menu),
      );
  }
}
