import { I18nFlavor } from '@grammyjs/i18n';
import { PaymentPeriod, PaymentProvider } from '@shared/payments';
import { UserDevice } from '@shared/user.types';
import { UserDto } from '@workspace/types';
import { Context, SessionFlavor as GrammySessionFlavor } from 'grammy';

export type BotContext = Context & SessionFlavor & I18nFlavor;
export type ErrorMessage = string;

export interface ClientApp {
  name: 'v2raytun' | 'happ';
  url: string;
  appUrl: string;
  platforms?: UserDevice[];
}

export interface SessionData {
  paymentUrl: string | undefined;
  paymentId: string | undefined;
  clientApp: Array<ClientApp> | undefined;
  redirectUrl?: string;
  subscriptionUrl?: string;
  selectedDevice?: UserDevice;
  selectedProvider?: PaymentProvider;
  selectedPeriod?: PaymentPeriod;
  billingPortalUrl?: string;
  hasActiveSubscription?: boolean;
  /**
   * Primary id of the currently-rendered saved payment method on the profile
   * screen. Populated by `ProfileMenuService.init()` right before rendering so
   * the profile menu's dynamic "delete" button knows which row to drop.
   */
  activeSavedMethodId?: string;
  metadata?: {
    messageId?: number;
  };
  user: Partial<UserDto>;
}

export type SessionFlavor = GrammySessionFlavor<SessionData>;

export const initialSession = (): SessionData => {
  return {
    paymentUrl: undefined,
    paymentId: undefined,
    selectedDevice: undefined,
    selectedPeriod: undefined,
    subscriptionUrl: undefined,
    clientApp: [],
    metadata: {
      messageId: undefined,
    },
    billingPortalUrl: undefined,
    hasActiveSubscription: false,
    activeSavedMethodId: undefined,
    user: {
      uuid: undefined,
      telegramId: undefined,
      username: undefined,
      expireAt: undefined,
      subscriptionUrl: undefined,
    },
  };
};
