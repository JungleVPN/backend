import type { User } from '@supabase/supabase-js';
import type { AuthSource, TelegramUser } from '@workspace/platform';
import type { GetUserByUuidResponseDto } from '@workspace/types';

export interface IState {
  /** Supabase authenticated user. Populated on web. Always null in TMA. */
  authUser: User | null;

  /** Remnawave panel user — the shared backend identity across both platforms. */
  rmnUser: GetUserByUuidResponseDto | null;

  /** True while initial auth resolution is in progress. */
  loading: boolean;

  /**
   * Which authentication mechanism resolved the current session.
   *  'web'      → Supabase OTP session (apps/web)
   *  'telegram' → Telegram initData validation (apps/tma, Phase 2)
   *  null       → not yet resolved
   */
  authSource: AuthSource | null;

  /**
   * Telegram user parsed from validated initData.
   * Populated in apps/tma after TmaAuthProvider completes (Phase 2).
   * Always null on web.
   */
  tgUser: TelegramUser | null;

  /**
   * The raw initData string from Telegram, stored after backend validation.
   * Injected into every API request via X-Telegram-Init-Data header (Phase 2).
   * Always null on web.
   */
  tgInitDataRaw: string | null;
}

export interface IActions {
  actions: {
    setAuthUser: (user: User | null) => void;
    setRmnUser: (user: GetUserByUuidResponseDto | null) => void;
    setLoading: (loading: boolean) => void;
    setAuthSource: (source: AuthSource | null) => void;
    setTgUser: (user: TelegramUser | null) => void;
    setTgInitDataRaw: (raw: string | null) => void;
  };
}
