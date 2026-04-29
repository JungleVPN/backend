// ─── Core platform types ──────────────────────────────────────────────────────

export type PlatformType = 'web' | 'telegram';
export type AuthSource = 'web' | 'telegram';
export type InitStatus = 'idle' | 'initializing' | 'ready' | 'error';

// ─── Telegram user shape (from initData) ─────────────────────────────────────

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
}

// ─── Sub-adapter interfaces ───────────────────────────────────────────────────

export interface HapticAdapter {
  /** Physical tap / touch feedback. */
  impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  /** Outcome feedback (success / error / warning). */
  notification(type: 'error' | 'success' | 'warning'): void;
  /** Selection change feedback (e.g. picker scroll). */
  selection(): void;
}

export interface NavigationAdapter {
  /**
   * Register a handler that fires when the platform back action is triggered.
   * Returns an unsubscribe function — call it in a useEffect cleanup.
   */
  onBack(handler: () => void): () => void;
  /** Show the platform back control (no-op on web — browser owns back). */
  showBack(): void;
  /** Hide the platform back control (no-op on web). */
  hideBack(): void;
}

// ─── Top-level adapter interface ─────────────────────────────────────────────

/**
 * PlatformAdapter is the single contract that every platform-specific
 * implementation must satisfy. Shared components access platform services
 * exclusively through this interface via the usePlatform() hook.
 *
 * Web implementation: WebPlatformAdapter
 * TMA implementation: TelegramPlatformAdapter (completed through Phase 2–5)
 */
export interface PlatformAdapter {
  /** Identifies the current runtime. Read-only after construction. */
  readonly type: PlatformType;

  /**
   * Returns HTTP headers to attach to every API request.
   *
   * Web:      { 'X-Api-Key': env.authApiKey }
   * Telegram: { 'X-Telegram-Init-Data': initDataRaw }  (Phase 2)
   */
  getAuthHeaders(): Record<string, string> | Promise<Record<string, string>>;

  haptic: HapticAdapter;
  navigation: NavigationAdapter;

  /**
   * Open an external URL safely.
   * Web:      window.open with noopener/noreferrer
   * Telegram: WebApp.openLink() to preserve the TMA session (Phase 5)
   */
  openUrl(url: string): void;

  /**
   * Close the current context.
   * Web:      navigate to /
   * Telegram: WebApp.close() (Phase 5)
   */
  close(): void;
}
