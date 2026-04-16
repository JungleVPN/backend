import { Menu } from '@bot/navigation';
import { DevicesMenu } from '@bot/navigation/features/devices/devices.menu';
import { DonateMenu } from '@bot/navigation/features/donation/donate.menu';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { ReferralMenu } from '@bot/navigation/features/referral/referral.menu';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { SupportMenu } from '@bot/navigation/features/support/support.menu';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MenuTree {
  constructor(
    private readonly mainMenu: MainMenu,
    private readonly devicesMenu: DevicesMenu,
    private readonly paymentMenu: PaymentMenu,
    private readonly paymentsPeriodsMenu: PaymentsPeriodsMenu,
    private readonly paymentMethodsMenu: PaymentMethodMenu,
    private readonly subscriptionMenu: SubscriptionMenu,
    private readonly profileMenu: ProfileMenu,
    private readonly supportMenu: SupportMenu,
    private readonly referralMenu: ReferralMenu,
    private readonly donateMenu: DonateMenu,
  ) {}

  init(): Menu {
    const main = this.mainMenu.menu;
    const subscriptionMenu = this.subscriptionMenu.menu;
    const devices = this.devicesMenu.menu;
    const paymentMenu = this.paymentMenu.menu;
    const paymentsPeriodsMenu = this.paymentsPeriodsMenu.menu;
    const paymentMethodsMenu = this.paymentMethodsMenu.menu;
    const profileMenu = this.profileMenu.menu;
    const supportMenu = this.supportMenu.menu;
    const referralMenu = this.referralMenu.menu;
    const donateMenu = this.donateMenu.menu;

    main.register(devices);
    main.register(paymentMenu);
    main.register(paymentsPeriodsMenu);
    main.register(subscriptionMenu);
    main.register(paymentMethodsMenu);
    main.register(profileMenu);
    main.register(supportMenu);
    main.register(referralMenu);
    main.register(donateMenu);

    return main;
  }
}
