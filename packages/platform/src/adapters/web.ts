import type { HapticAdapter, NavigationAdapter, PlatformAdapter } from '../types';

// ─── Haptic via Web Vibration API ─────────────────────────────────────────────

const webHaptic: HapticAdapter = {
  impact(style) {
    if (!('vibrate' in navigator)) return;
    const patterns: Record<string, number[]> = {
      light: [10],
      medium: [20],
      heavy: [40],
      rigid: [50],
      soft: [15],
    };
    navigator.vibrate(patterns[style] ?? [10]);
  },

  notification(type) {
    if (!('vibrate' in navigator)) return;
    const patterns: Record<string, number[]> = {
      success: [10, 50, 20],
      error: [50, 30, 50],
      warning: [30, 50, 30],
    };
    navigator.vibrate(patterns[type] ?? [20]);
  },

  selection() {
    if (!('vibrate' in navigator)) return;
    navigator.vibrate([15]);
  },
};

// ─── Navigation (web uses browser history natively) ───────────────────────────

const webNavigation: NavigationAdapter = {
  onBack(_handler) {
    // Web: the browser's own back button handles this.
    // Components that need back-navigation use React Router's navigate(-1).
    return () => {};
  },
  showBack() {
    // No-op — the browser chrome owns the back button.
  },
  hideBack() {
    // No-op — the browser chrome owns the back button.
  },
};

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * WebPlatformAdapter — concrete PlatformAdapter for the browser environment.
 *
 * Constructed once in apps/web/src/main.tsx and provided to the entire tree
 * via PlatformProvider. The apiKey is passed at construction time from env.ts
 * so the adapter itself never reads import.meta.env directly.
 */
export class WebPlatformAdapter implements PlatformAdapter {
  readonly type = 'web' as const;

  private readonly apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getAuthHeaders(): Record<string, string> {
    if (!this.apiKey) return {};
    return { 'X-Api-Key': this.apiKey };
  }

  haptic = webHaptic;
  navigation = webNavigation;

  openUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  close(): void {
    window.location.href = '/';
  }
}
