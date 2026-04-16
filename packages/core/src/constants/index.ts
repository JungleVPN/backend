/**
 * Shared constants used across TMA, Web, and potentially Bot.
 * Environment-specific values (API URLs, keys) should come from
 * each app's own env config and be injected via providers.
 */

export const APP_NAME = 'JungleVPN';

export const SUBSCRIPTION_PERIODS = {
  MONTHLY: 1,
  QUARTERLY: 3,
  YEARLY: 12,
} as const;

export type SubscriptionPeriod =
  (typeof SUBSCRIPTION_PERIODS)[keyof typeof SUBSCRIPTION_PERIODS];

export const SUPPORTED_CURRENCIES = ['RUB', 'EUR', 'USD'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
