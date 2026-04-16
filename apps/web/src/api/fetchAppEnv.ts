import { env } from '@/config/env';
import type { AppConfig } from '@/store/appConfig';

/**
 * In the Next.js version this was a server-side endpoint that read process.env.
 * In the SPA we read from Vite env vars directly — no network call needed.
 * This function is kept for API consistency with the rest of the codebase;
 * it can later be replaced with a real endpoint if needed.
 */
export async function fetchAppEnv(): Promise<AppConfig> {
  return {
    cryptoLink: env.cryptoLink,
    buyLink: env.buyLink,
    redirectLink: env.redirectLink,
    isSnowflakeEnabled: env.forceSnowflakes,
  };
}
