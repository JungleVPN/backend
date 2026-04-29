import { init } from '@tma.js/sdk-react';

/**
 * tma-sdk.ts — Thin, typed wrapper around window.Telegram.WebApp.
 *
 * Phase 1: Uses the native window.Telegram.WebApp global directly.
 *          No @telegram-apps/sdk-react dependency in this file.
 * Phase 2: TmaAuthProvider will call getInitDataRaw() and post it to the
 *          backend for HMAC validation before trusting any user data.
 * Phase 3: backButton delegates to BackButton API.
 * Phase 5: hapticFeedback and openLink delegate to the native APIs.
 *
 * All methods degrade gracefully when called outside a Telegram WebView
 * (e.g. during browser-based development).
 */

// ─── Internal WebApp type (matches Telegram Bot API) ─────────────────────────

interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  initData: string;
  initDataUnsafe: {
    user?: TgUser;
    start_param?: string;
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: Record<string, string>;
  BackButton: {
    show(): void;
    hide(): void;
    onClick(fn: () => void): void;
    offClick(fn: () => void): void;
    isVisible: boolean;
  };
  MainButton: {
    show(): void;
    hide(): void;
    setText(text: string): void;
    onClick(fn: () => void): void;
    offClick(fn: () => void): void;
    isVisible: boolean;
  };
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
    notificationOccurred(type: 'error' | 'success' | 'warning'): void;
    selectionChanged(): void;
  };
}

// ─── Accessor ────────────────────────────────────────────────────────────────

function getWebApp(): TelegramWebApp | null {
  const tg = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram;
  return tg?.WebApp ?? null;
}

// ─── Public SDK object ────────────────────────────────────────────────────────

export const tmaSDK = {
  init,
  /** True when running inside a Telegram WebView. */
  isAvailable(): boolean {
    return getWebApp() !== null;
  },

  /**
   * Signal to Telegram that the Mini App has finished loading.
   * Should be called as early as possible to dismiss the splash screen.
   */
  ready(): void {
    getWebApp()?.ready();
  },

  /**
   * Request full-height expansion of the Mini App viewport.
   * Call once after ready() — safe to call if already expanded.
   */
  expand(): void {
    getWebApp()?.expand();
  },

  /** Close the Mini App and return the user to Telegram. */
  close(): void {
    getWebApp()?.close();
  },

  /**
   * Open an external URL in the Telegram in-app browser.
   * Preserves the TMA session — use instead of window.open().
   */
  openLink(url: string): void {
    const webApp = getWebApp();
    if (webApp) {
      webApp.openLink(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  },

  /**
   * The raw initData string injected by Telegram.
   * Pass this to POST /auth/tma/validate on the backend (Phase 2).
   * Empty string when not in Telegram.
   */
  getInitDataRaw(): string {
    return getWebApp()?.initData ?? '';
  },

  /**
   * Unsafe Telegram user object — available immediately, NOT validated.
   *
   * Phase 1: Used directly as a display identity.
   * Phase 2: Replaced with server-validated user returned by /auth/tma/validate.
   */
  getUnsafeUser(): TgUser | null {
    return getWebApp()?.initDataUnsafe?.user ?? null;
  },

  /**
   * start_param from the Telegram deep link (?startapp=VALUE).
   * Used for deep-link routing after auth resolves (Phase 3).
   */
  getStartParam(): string | undefined {
    return getWebApp()?.initDataUnsafe?.start_param;
  },

  /** Telegram client platform string (android | ios | tdesktop | macos | web). */
  getPlatform(): string {
    return getWebApp()?.platform ?? 'unknown';
  },

  /** Telegram WebApp SDK version. */
  getVersion(): string {
    return getWebApp()?.version ?? '0';
  },

  /** Direct access to Telegram BackButton API (Phase 3). */
  get backButton() {
    return getWebApp()?.BackButton ?? null;
  },

  /** Direct access to Telegram HapticFeedback API (Phase 5). */
  get hapticFeedback() {
    return getWebApp()?.HapticFeedback ?? null;
  },
} as const;
