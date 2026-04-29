import type { HapticAdapter, NavigationAdapter, PlatformAdapter } from '../types';

// ─── Phase 0 stubs — filled in progressively through Phase 2–5 ───────────────

const stubHaptic: HapticAdapter = {
  impact(_style) {
    // Phase 5: HapticFeedback.impactOccurred(style)
  },
  notification(_type) {
    // Phase 5: HapticFeedback.notificationOccurred(type)
  },
  selection() {
    // Phase 5: HapticFeedback.selectionChanged()
  },
};

const stubNavigation: NavigationAdapter = {
  onBack(_handler) {
    // Phase 3: BackButton.onClick(handler); return () => BackButton.offClick(handler)
    return () => {};
  },
  showBack() {
    // Phase 3: BackButton.show()
  },
  hideBack() {
    // Phase 3: BackButton.hide()
  },
};

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * TelegramPlatformAdapter — concrete PlatformAdapter for the Telegram Mini App
 * environment. This is a stub at Phase 0. It is filled in phase-by-phase:
 *
 *  Phase 2: getAuthHeaders() returns { 'X-Telegram-Init-Data': initDataRaw }
 *  Phase 3: navigation delegates to SDK BackButton
 *  Phase 5: haptic delegates to SDK HapticFeedback; openUrl uses WebApp.openLink
 *
 * The initDataRaw string is injected after TmaAuthProvider validates it and
 * writes it to the auth store. The adapter reads it lazily on each request.
 */
export class TelegramPlatformAdapter implements PlatformAdapter {
  readonly type = 'telegram' as const;

  /**
   * Set by TmaAuthProvider (Phase 2) once initData is validated.
   * Accessed lazily so that getAuthHeaders() always returns the latest value.
   */
  private initDataRaw: string | null = null;

  setInitDataRaw(raw: string): void {
    this.initDataRaw = raw;
  }

  getAuthHeaders(): Record<string, string> {
    // Phase 0: no auth header yet — TmaAuthProvider not yet implemented.
    // Phase 2: returns { 'X-Telegram-Init-Data': this.initDataRaw ?? '' }
    if (this.initDataRaw) {
      return { 'X-Telegram-Init-Data': this.initDataRaw };
    }
    return {};
  }

  haptic = stubHaptic;
  navigation = stubNavigation;

  openUrl(url: string): void {
    // Phase 5: window.Telegram?.WebApp?.openLink(url)
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  close(): void {
    // Phase 5: window.Telegram?.WebApp?.close()
    window.location.href = '/';
  }
}
