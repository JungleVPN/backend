import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@workspace/core/i18n';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

export const defaultLocale = DEFAULT_LOCALE;
export const supportedLocales = SUPPORTED_LOCALES;

/**
 * TMA i18n setup. Mirrors the web configuration.
 *
 * Language detection order: localStorage → Telegram language_code (set by
 * TmaAuthProvider after auth resolves) → browser navigator → html lang attr.
 *
 * Translations are loaded from /locales/{{lng}}.json — the TMA app ships its
 * own copy of the locale files in public/locales/ (identical to web).
 */
i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: defaultLocale,
    supportedLngs: [...supportedLocales],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
