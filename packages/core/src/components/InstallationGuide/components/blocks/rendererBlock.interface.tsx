import type {
  TSubscriptionPageBlockConfig,
  TSubscriptionPageButtonConfig,
  TSubscriptionPageLanguageCode,
} from '@workspace/types';
import type { ReactNode } from 'react';

/** Visual style for block action buttons (maps to HeroUI `Button` variants). */
export type BlockButtonVariant = 'light' | 'subtle';

export interface IBlockRendererProps {
  blocks: TSubscriptionPageBlockConfig[];
  currentLang: TSubscriptionPageLanguageCode;
  getIconFromLibrary: (iconKey: string) => string;
  renderBlockButtons: (
    buttons: TSubscriptionPageButtonConfig[],
    variant: BlockButtonVariant,
  ) => ReactNode;
  svgLibrary: Record<string, string>;
}
