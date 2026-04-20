/**
 * Application environment configuration.
 * All env vars are read from Vite's import.meta.env (VITE_ prefix).
 * This module centralizes access so the rest of the app never touches import.meta.env directly.
 * When this package moves into the monorepo, these can be injected from a shared config package.
 */
export const env = {
  remnawavePanelUrl: import.meta.env.VITE_REMNAWAVE_PANEL_URL ?? '',
  paymentsUrl: import.meta.env.VITE_PAYMENTS_URL ?? '',
  remnawaveToken: import.meta.env.VITE_REMNAWAVE_TOKEN ?? '',
  buyLink: import.meta.env.VITE_BUY_LINK ?? '',
  cryptoLink: import.meta.env.VITE_CRYPTO_LINK === 'true',
  redirectLink:
    import.meta.env.VITE_REDIRECT_LINK || 'https://maposia.github.io/redirect-page/?redirect_to=',
  authApiKey: import.meta.env.VITE_AUTH_API_KEY ?? '',
  customSubDomain: import.meta.env.VITE_CUSTOM_SUB_DOMAIN === 'true',
  telegramBotToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? '',
  forceSnowflakes: import.meta.env.VITE_FORCE_SNOWFLAKES === 'true',
  trialPeriodInDays: import.meta.env.VITE_TRIAL_PERIOD_IN_DAYS || '365',
  internalSquads: JSON.parse(import.meta.env.VITE_INTERNAL_SQUADS || '[]') as string[],
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  subpageConfigUuid: '00000000-0000-0000-0000-000000000000',
  paymentDescription: import.meta.env.VITE_PAYMENT_DESCRIPTION ?? 'Happy to see you in the JUNGLE',
  priceRub: import.meta.env.VITE_PRICE_RUB ?? '99',
  selectedPeriodMonths: Number(import.meta.env.VITE_SELECTED_PERIOD_MONTHS ?? '1'),
} as const;
