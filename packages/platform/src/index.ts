// ─── Detection ───────────────────────────────────────────────────────────────
export { detectPlatform } from './detect';

// ─── Context + hook ───────────────────────────────────────────────────────────
export { PlatformProvider, usePlatform } from './context';
export type { PlatformProviderProps } from './context';

// ─── Adapters ─────────────────────────────────────────────────────────────────
export { WebPlatformAdapter } from './adapters/web';
export { TelegramPlatformAdapter } from './adapters/telegram';

// ─── Types ────────────────────────────────────────────────────────────────────
export type {
  PlatformType,
  AuthSource,
  InitStatus,
  TelegramUser,
  PlatformAdapter,
  HapticAdapter,
  NavigationAdapter,
} from './types';
