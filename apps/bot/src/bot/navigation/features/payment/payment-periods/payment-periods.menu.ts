import { Menu } from '@bot/navigation';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { Base } from '@bot/navigation/menu.base';
import { paymentPeriods } from '@bot/utils/constants';
import { mapPeriodLabelToPriceLabel } from '@bot/utils/utils';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class PaymentsPeriodsMenu extends Base implements OnModuleInit {
  readonly menu = new Menu('paymentPeriods-menu');

  constructor(
    readonly mainMenuService: MainMenuService,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => PaymentMethodMenu))
    readonly paymentMethodMenu: PaymentMethodMenu,
  ) {
    super();
  }

  onModuleInit() {
    this.menu.dynamic((_, range) => {
      paymentPeriods.forEach((item) => {
        range.text(
          (ctx) =>
            ctx.t(mapPeriodLabelToPriceLabel(item), {
              discount: item === 'month_3' ? '-15%' : '-25%',
            }),

          async (ctx) => {
            ctx.session.selectedPeriod = item;
            await this.render(ctx, ctx.t('payment-methods-text'), this.paymentMethodMenu.menu);
          },
        );
        range.row();
      });

      range.row();
      range.text({ text: (ctx) => ctx.t('back-button-label') }, async (ctx) => {
        await this.mainMenuService.init(ctx, this.mainMenu.menu);
      });
    });
  }
}
