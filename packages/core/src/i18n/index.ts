/**
 * Shared i18n configuration used by both web and TMA.
 * Each app initializes i18next with its own setup, but these constants
 * ensure locale lists and fallback behavior are consistent.
 */

export const DEFAULT_LOCALE = 'ru' as const;
export const SUPPORTED_LOCALES = ['ru', 'en', 'zh', 'fa'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
