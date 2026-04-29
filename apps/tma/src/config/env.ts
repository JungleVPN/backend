/**
 * TMA application environment configuration.
 * All vars are read from Vite's import.meta.env (VITE_ prefix).
 * This module centralises access so the rest of the app never touches
 * import.meta.env directly.
 *
 * Current .env:
 *   VITE_API_URL=https://api.thejungle.pro
 *   BASE_URL=https://tma.thejungle.pro
 */
export const env = {
  /** Base URL for the NestJS API (remnawave proxy + payments). */
  apiUrl: import.meta.env.VITE_API_URL ?? '',

  /** Payments service URL — falls back to apiUrl if not set separately. */
  paymentsUrl: import.meta.env.VITE_PAYMENTS_URL ?? import.meta.env.VITE_API_URL ?? '',

  /** The fixed UUID used to fetch the subscription page config. */
  subpageConfigUuid: '00000000-0000-0000-0000-000000000000',

  /** Trial period shown in the UI when no subscription exists. */
  trialPeriodInDays: import.meta.env.VITE_TRIAL_PERIOD_IN_DAYS || '365',
} as const;
