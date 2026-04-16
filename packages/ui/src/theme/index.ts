/**
 * Maps Telegram's CSS variables to JungleVPN design tokens.
 * Call this once in the TMA app's root to bridge Telegram's theme into shared components.
 */
export function applyTelegramThemeMapping(): void {
  const root = document.documentElement;
  const mappings: [string, string][] = [
    ['--jv-color-bg', '--tg-theme-bg-color'],
    ['--jv-color-bg-secondary', '--tg-theme-secondary-bg-color'],
    ['--jv-color-text', '--tg-theme-text-color'],
    ['--jv-color-text-secondary', '--tg-theme-hint-color'],
    ['--jv-color-accent', '--tg-theme-button-color'],
    ['--jv-color-accent-text', '--tg-theme-button-text-color'],
    ['--jv-color-destructive', '--tg-theme-destructive-text-color'],
    ['--jv-color-surface', '--tg-theme-bg-color'],
    ['--jv-color-border', '--tg-theme-hint-color'],
  ];

  for (const [jvVar, tgVar] of mappings) {
    const value = getComputedStyle(root).getPropertyValue(tgVar).trim();
    if (value) {
      root.style.setProperty(jvVar, value);
    }
  }
}

/**
 * Applies the web theme by setting data-theme attribute.
 */
export function applyWebTheme(mode: 'light' | 'dark'): void {
  document.documentElement.setAttribute('data-theme', mode);
}
