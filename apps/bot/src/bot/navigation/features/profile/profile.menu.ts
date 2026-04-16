import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { ProfileMenuService } from '@bot/navigation/features/profile/profile-menu.service';
import { Base } from '@bot/navigation/menu.base';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ProfileMenu extends Base {
  readonly menu = new Menu('profile-menu');

  constructor(
    @Inject(forwardRef(() => DevicesMenu))
    readonly devicesMenu: DevicesMenu,
    @Inject(forwardRef(() => MainMenu))
    readonly mainMenu: MainMenu,
    @Inject(forwardRef(() => MainMenuService))
    readonly mainMenuService: MainMenuService,
    @Inject(forwardRef(() => ProfileMenuService))
    readonly profileMenuService: ProfileMenuService,
    readonly paymentMethodMenu: PaymentMethodMenu,
  ) {
    super();

    this.menu
      // .dynamic(async (ctx, range) => {
      //   const keyboard = new InlineKeyboard();
      //
      //   if (ctx.session.hasActiveSubscription) {
      //     range.url(
      //       (ctx) => ctx.t('subscription-button-label'),
      //       async (ctx) => {
      //         return ctx.session.billingPortalUrl || 'https://example.com';
      //       },
      //     );
      //   } else {
      //     range.text(
      //       (ctx) => ctx.t('subscription-button-label'),
      //       async (ctx) => {
      //         await this.render(
      //           ctx,
      //           ctx.t('no-active-subscription-text'),
      //           keyboard
      //             .text(ctx.t('extend-button-label'), 'navigate_payment_periods')
      //             .row()
      //             .text(ctx.t('home-button-label'), 'navigate_main'),
      //           true,
      //         );
      //       },
      //     );
      //   }
      // })
      .dynamic(async (ctx, range) => {
        // Only render the delete button when `ProfileMenuService.init()` has
        // resolved an active saved method on the current message — otherwise
        // there's nothing to delete.
        if (!ctx.session.activeSavedMethodId) {
          range.text(
            (ctx) => ctx.t('pay-button-label'),
            async (ctx) => {
              await this.render(ctx, ctx.t('payment-methods-text'), this.paymentMethodMenu.menu);
            },
          );
        } else {
          range
            .text(
              (ctx) => ctx.t('profile-delete-method-button-label'),
              async (ctx) => {
                await this.profileMenuService.deleteActiveMethod(ctx);
              },
            )
            .row();
        }
      })

      .row()
      .text(
        async (ctx) => ctx.t('home-button-label'),
        async (ctx) => this.mainMenuService.init(ctx, this.mainMenu.menu),
      );
  }
}
