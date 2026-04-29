import type { PlatformType } from './types';

/**
 * Detects the current runtime platform using a layered signal strategy.
 *
 * This function has NO side effects — it is safe to call at module evaluation
 * time, before React mounts, and before the TMA SDK is initialised.
 *
 * Detection priority:
 *  1. URL hash fragment — Telegram injects `#tgWebAppData=…` on Mini App launch.
 *     This is the most reliable signal and is available immediately.
 *  2. window.Telegram.WebApp — defined in all Telegram client versions.
 *  3. Fallback — returns 'web' (the safe default).
 *
 * Security note: this function is for UX routing only. The backend must
 * independently validate every request regardless of the client-reported platform.
 */
export function detectPlatform(): PlatformType {
  if (typeof window === 'undefined') {
    // SSR guard — not used in this project but safe to have
    return 'web';
  }

  // Signal 1: Telegram URL hash fragment
  if (window.location.hash.includes('tgWebAppData')) {
    return 'telegram';
  }

  // Signal 2: Telegram global WebApp object
  const tg = (window as unknown as Record<string, unknown>)['Telegram'] as
    | { WebApp?: unknown }
    | undefined;

  if (tg?.WebApp !== undefined) {
    return 'telegram';
  }

  return 'web';
}
