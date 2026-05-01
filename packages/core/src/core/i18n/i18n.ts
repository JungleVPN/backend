/**
 * Shared i18next bootstrap for web and TMA. Translations are bundled (not fetched from
 * `/locales/…`) so Mini Apps and non-root deploy paths always resolve strings.
 */
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';

export const DEFAULT_LOCALE = 'ru' as const;
export const SUPPORTED_LOCALES = ['ru', 'en', 'zh', 'fa'] as const;

/** zh/fa reuse English until dedicated files exist */
const resources = {
  ru: { translation: ru },
  en: { translation: en },
  zh: { translation: en },
  fa: { translation: en },
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
