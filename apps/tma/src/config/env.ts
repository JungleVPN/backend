export const env = {
  remnawaveUrl: import.meta.env.VITE_REMNAWAVE_URL ?? '',
  paymentsUrl: import.meta.env.VITE_PAYMENTS_URL ?? '',
  subpageConfigUuid: '00000000-0000-0000-0000-000000000000',
  trialPeriodInDays: import.meta.env.VITE_TRIAL_PERIOD_IN_DAYS || '365',
  allowedAmounts: import.meta.env.VITE_ALLOWED_AMOUNTS ?? '',
  allowedPeriods: Number(import.meta.env.VITE_ALLOWED_PERIODS ?? 1),
} as const;
