import type { TSubscriptionPageLocalizedText } from '@workspace/types';
import { useCurrentLang, useSubscriptionConfig } from '@workspace/core/stores';
import { useCallback } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { getLocalizedText } from '@/utils/configParser';

export const useTranslation = () => {
  const config = useSubscriptionConfig();
  const currentLang = useCurrentLang();
  const { t: tStatic } = useI18nextTranslation();

  const t = useCallback(
    (textObj: TSubscriptionPageLocalizedText) => getLocalizedText(textObj, currentLang),
    [currentLang],
  );

  return {
    t,
    tStatic,
    currentLang,
    baseTranslations: config?.baseTranslations,
  };
};
