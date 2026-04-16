import { LocalisationService } from '@bot/localisation/localisation.service';
import { DonateMenu } from '@bot/navigation/features/donation/donate.menu';
import { MainMenu } from '@bot/navigation/features/main/main.menu';
import { MainMenuService } from '@bot/navigation/features/main/main.service';
import { PaymentMenu } from '@bot/navigation/features/payment/payment.menu';
import { PaymentMsgService } from '@bot/navigation/features/payment/payment.service';
import { PaymentMethodMenu } from '@bot/navigation/features/payment/payment-method/payment-method.menu';
import { PaymentMethodMsgService } from '@bot/navigation/features/payment/payment-method/payment-method.service';
import { PaymentsPeriodsMenu } from '@bot/navigation/features/payment/payment-periods/payment-periods.menu';
import { ProfileMenu } from '@bot/navigation/features/profile/profile.menu';
import { ProfileMenuService } from '@bot/navigation/features/profile/profile-menu.service';
import { ReferralMenu } from '@bot/navigation/features/referral/referral.menu';
import { ReferralMenuService } from '@bot/navigation/features/referral/referral.service';
import { RevokeSubMenuService } from '@bot/navigation/features/subscription/revokeSub.service';
import { SubscriptionMsgService } from '@bot/navigation/features/subscription/subscribtion.service';
import { SubscriptionMenu } from '@bot/navigation/features/subscription/subscription.menu';
import { SupportMenu } from '@bot/navigation/features/support/support.menu';
import { Module } from '@nestjs/common';
import { CurrencyService } from '@payments/currency-service/currency.service';
import { PaymentsService } from '@payments/payments.service';
import { ReferralService } from '@referral/referral.service';
import { RemnaService } from '@remna/remna.service';
import { DevicesMenu } from './features/devices/devices.menu';
import { MenuTree } from './menu.tree';

@Module({
  providers: [
    // SERVICES
    MainMenuService,
    PaymentMsgService,
    RevokeSubMenuService,
    SubscriptionMsgService,
    PaymentMethodMsgService,
    ProfileMenuService,
    ReferralMenuService,
    RemnaService,
    ReferralService,
    LocalisationService,
    PaymentsService,
    CurrencyService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    PaymentMethodMenu,
    ProfileMenu,
    SupportMenu,
    ReferralMenu,
    DonateMenu,
  ],
  exports: [
    // SERVICES
    MainMenuService,
    PaymentMsgService,
    RevokeSubMenuService,
    SubscriptionMsgService,
    PaymentMethodMsgService,
    ProfileMenuService,
    ReferralMenuService,
    // MENUS
    MenuTree,
    MainMenu,
    DevicesMenu,
    PaymentsPeriodsMenu,
    PaymentMenu,
    SubscriptionMenu,
    PaymentMethodMenu,
    ProfileMenu,
    SupportMenu,
    ReferralMenu,
    DonateMenu,
  ],
})
export class MenuModule {}
