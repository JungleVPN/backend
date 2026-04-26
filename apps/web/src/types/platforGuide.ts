import type {
  TSubscriptionPageAppConfig,
  TSubscriptionPagePlatformKey,
} from '@remnawave/subscription-page-types';

export interface IPlatformGuideProps {
  getAppsByPlatform: (platform: TSubscriptionPagePlatformKey) => TSubscriptionPageAppConfig[];
  getSelectedApp: (
    platform: TSubscriptionPagePlatformKey,
  ) => TSubscriptionPageAppConfig | undefined;
  openDeepLink: (url: string) => void;
}
