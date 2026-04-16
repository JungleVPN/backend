import type {
  TSubscriptionPageBlockConfig,
  TSubscriptionPageButtonConfig,
  TSubscriptionPageLanguageCode,
} from '@remnawave/subscription-page-types';
import type { ButtonVariant } from '@mantine/core';

export interface IBlockRendererProps {
  blocks: TSubscriptionPageBlockConfig[];
  currentLang: TSubscriptionPageLanguageCode;
  getIconFromLibrary: (iconKey: string) => string;
  renderBlockButtons: (
    buttons: TSubscriptionPageButtonConfig[],
    variant: ButtonVariant,
  ) => React.ReactNode;
  svgLibrary: Record<string, string>;
}
