import type { AuthSource, TelegramUser } from '@workspace/platform';
import type { GetUserByUuidResponseDto } from '@workspace/types';

export interface IState {
  /**
   * Remnawave panel user — the shared backend identity for both platforms.
   * Populated by ProfileLayout after initUser({ telegramId }) resolves.
   */
  rmnUser: GetUserByUuidResponseDto | null;

  /** True while TmaAuthProvider is resolving the Telegram identity. */
  loading: boolean;

  /**
   * Always 'telegram' in this app once TmaAuthProvider completes.
   * Null until auth resolution finishes.
   */
  authSource: AuthSource | null;

  /**
   * Phase 1: populated from initDataUnsafe (NOT validated).
   * Phase 2: populated from server-validated initData response.
   */
  tgUser: TelegramUser | null;

  /**
   * Raw initData string from Telegram. Stored after backend validation (Phase 2).
   * Injected into every API request via X-Telegram-Init-Data header.
   * Phase 1: stored from window.Telegram.WebApp.initData directly.
   */
  tgInitDataRaw: string | null;
}

export interface IActions {
  actions: {
    setRmnUser: (user: GetUserByUuidResponseDto | null) => void;
    setLoading: (loading: boolean) => void;
    setAuthSource: (source: AuthSource | null) => void;
    setTgUser: (user: TelegramUser | undefined) => void;
    setTgInitDataRaw: (raw: string | null) => void;
  };
}
