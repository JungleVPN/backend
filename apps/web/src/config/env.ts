/**
 * Application environment configuration.
 * All env vars are read from Vite's import.meta.env (VITE_ prefix).
 * This module centralizes access so the rest of the app never touches import.meta.env directly.
 * When this package moves into the monorepo, these can be injected from a shared config package.
 */
export const env = {
  remnawaveUrl: import.meta.env.VITE_REMNAWAVE_URL ?? '',
  paymentsUrl: import.meta.env.VITE_PAYMENTS_URL ?? '',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  subpageConfigUuid: import.meta.env.VITE_SUBPAGE_CONFIG,
  allowedAmounts: import.meta.env.VITE_ALLOWED_AMOUNTS,
  allowedPeriods: Number(import.meta.env.VITE_ALLOWED_PERIODS ?? 1),
} as const;
