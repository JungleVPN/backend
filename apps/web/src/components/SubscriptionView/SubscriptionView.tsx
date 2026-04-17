import { Box, Center, Container, Stack, Title } from '@mantine/core';
import { useOs } from '@mantine/hooks';
import { ApiClientError } from '@workspace/core/api';
import {
  SubscriptionPageRawConfigSchema,
  type TSubscriptionPagePlatformKey,
} from '@workspace/types';
import { useEffect, useState } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { Snowfall } from 'react-snowfall';

import '@/utils/initDayjs';
import {
  useAppConfigStoreActions,
  useAppConfigStoreInfo,
  useCurrentLang,
  useIsConfigLoaded,
  useSubscriptionConfig,
  useSubscriptionConfigStoreActions,
  useSubscriptionInfoStoreActions,
  useSubscriptionInfoStoreInfo,
} from '@workspace/core/stores';
import { fetchAppEnv } from '@/api/fetchAppEnv';
import { remnawaveApi } from '@/api/instance';
import { AnimatedBackground } from '@/components/AnimatedBackground/AnimatedBackground';
import { ErrorConnection } from '@/components/ErrorConnection/ErrorConnection';
import {
  AccordionBlockRenderer,
  CardsBlockRenderer,
  InstallationGuideConnector,
  MinimalBlockRenderer,
  TimelineBlockRenderer,
} from '@/components/InstallationGuide';
import { LanguagePicker } from '@/components/LanguagePicker/LanguagePicker';
import { Loading } from '@/components/Loading/Loading';
import { SubscribeCta } from '@/components/SubscribeCTA/SubscribeCTA';
import {
  SubscriptionInfoCards,
  SubscriptionInfoCollapsed,
  SubscriptionInfoExpanded,
} from '@/components/SubscriptionInfo';
import { env } from '@/config/env';

function osToPlatform(os: string): TSubscriptionPagePlatformKey | undefined {
  switch (os) {
    case 'android':
      return 'android';
    case 'ios':
      return 'ios';
    case 'linux':
      return 'linux';
    case 'macos':
      return 'macos';
    case 'windows':
      return 'windows';
    default:
      return undefined;
  }
}

const BLOCK_RENDERERS = {
  cards: CardsBlockRenderer,
  timeline: TimelineBlockRenderer,
  accordion: AccordionBlockRenderer,
  minimal: MinimalBlockRenderer,
} as const;

const SUBSCRIPTION_INFO_BLOCK_RENDERERS = {
  cards: SubscriptionInfoCards,
  collapsed: SubscriptionInfoCollapsed,
  expanded: SubscriptionInfoExpanded,
  hidden: null,
} as const;

export function SubscriptionView(props: { shortUuid: string }) {
  const { shortUuid } = props;
  const { t } = useI18nextTranslation();
  const config = useSubscriptionConfig();
  const subscriptionActions = useSubscriptionInfoStoreActions();
  const configActions = useSubscriptionConfigStoreActions();
  const appConfigActions = useAppConfigStoreActions();
  const currentLang = useCurrentLang();
  const { setLanguage } = useSubscriptionConfigStoreActions();
  const os = useOs({ getValueInEffect: false });
  const { appConfig } = useAppConfigStoreInfo();
  const { subscription } = useSubscriptionInfoStoreInfo();

  const [errorConnect, setErrorConnect] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigLoaded = useIsConfigLoaded();
  const activeSubscription = subscription?.user?.userStatus === 'ACTIVE';

  useEffect(() => {
    if (!shortUuid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const fetchSubscription = async () => {
      try {
        const subscription = await remnawaveApi.getSubscriptionByShortUuid(shortUuid);
        if (subscription) {
          subscriptionActions.setSubscriptionInfo({ subscription });
        }
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 404) {
          setErrorConnect('ERR_GET_SUB_LINK');
        } else {
          setErrorConnect('ERR_FATCH_USER');
        }
        console.error('Failed to fetch subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [shortUuid, subscriptionActions]);

  useEffect(() => {
    const targetUuid = '00000000-0000-0000-0000-000000000000';
    let retryCount = 0;
    const maxRetries = 3;

    const fetchConfig = async () => {
      try {
        const configs = await remnawaveApi.fetchAppData(env.appDataUrl);

        const configId = subscription?.subpageConfigUuid || targetUuid;
        const tempConfig = configs[configId];

        if (!tempConfig) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(fetchConfig, 2000);
            return;
          }
          throw new Error(`Config with UUID ${configId} not found`);
        }

        const parsedConfig = await SubscriptionPageRawConfigSchema.safeParseAsync(tempConfig);
        if (!parsedConfig.success) {
          setErrorConnect('ERR_PARSE_APPCONFIG');
          return;
        }

        configActions.setConfig(parsedConfig.data);
      } catch (error: any) {
        if (error.response?.status === 404 && retryCount < maxRetries) {
          retryCount++;
          setTimeout(fetchConfig, 2000);
          return;
        }
        setErrorConnect('ERR_PARSE_APPCONFIG');
      }
    };

    if (subscription || !shortUuid) {
      fetchConfig();
    }
  }, [configActions, subscription, shortUuid]);

  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const appConfig = await fetchAppEnv();
        if (appConfig) appConfigActions.setAppConfig(appConfig);
      } catch (error) {
        console.error('Failed to fetch env config:', error);
      }
    };
    fetchEnv();
  }, [appConfigActions]);

  // Loading state
  if (isLoading || !isConfigLoaded) {
    return <Loading />;
  }

  // Error state
  if (errorConnect) {
    return (
      <Container my='xl' size='xl'>
        <Center>
          <Stack gap='xl'>
            <Title style={{ textAlign: 'center' }} order={4}>
              {errorConnect === 'ERR_FATCH_USER'
                ? t('main.page.component.ERR_FATCH_USER')
                : errorConnect === 'ERR_GET_SUB_LINK'
                  ? t('main.page.component.ERR_GET_SUB_LINK')
                  : errorConnect === 'ERR_PARSE_APPCONFIG'
                    ? t('main.page.component.ERR_PARSE_APPCONFIG')
                    : JSON.stringify(errorConnect)}
            </Title>
            <ErrorConnection />
          </Stack>
        </Center>
      </Container>
    );
  }

  // Missing ID state
  if (!shortUuid) {
    return (
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container size='xl'>
          <Title style={{ textAlign: 'center' }} order={4}>
            {t('main.page.component.missing_id')}
          </Title>
        </Container>
      </Box>
    );
  }

  // No active subscription state
  if (!activeSubscription) {
    return (
      <Box
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Container size='xl'>
          <Stack gap='xl'>
            <Title style={{ textAlign: 'center' }} order={4}>
              {t('main.page.component.no-sub')}
            </Title>
            <SubscribeCta />
            <Center mt={20}>
              <LanguagePicker
                currentLang={currentLang}
                locales={config?.locales ?? []}
                onLanguageChange={setLanguage}
              />
            </Center>
          </Stack>
        </Container>
      </Box>
    );
  }

  // Final render (guaranteed that config is loaded)
  const hasPlatformApps: Record<TSubscriptionPagePlatformKey, boolean> = {
    ios: Boolean(config.platforms.ios?.apps.length),
    android: Boolean(config.platforms.android?.apps.length),
    linux: Boolean(config.platforms.linux?.apps.length),
    macos: Boolean(config.platforms.macos?.apps.length),
    windows: Boolean(config.platforms.windows?.apps.length),
    androidTV: Boolean(config.platforms.androidTV?.apps.length),
    appleTV: Boolean(config.platforms.appleTV?.apps.length),
  };

  const atLeastOnePlatformApp = Object.values(hasPlatformApps).some((value) => value);
  const SubscriptionInfoBlockRenderer =
    SUBSCRIPTION_INFO_BLOCK_RENDERERS[config.uiConfig.subscriptionInfoBlockType];

  return (
    <Box style={{ position: 'relative' }}>
      {appConfig?.isSnowflakeEnabled ? (
        <Snowfall style={{ position: 'fixed', zIndex: 2 }} speed={[0, 1]} />
      ) : (
        <AnimatedBackground />
      )}
      <Stack style={{ zIndex: 2 }} gap='xl'>
        {SubscriptionInfoBlockRenderer && <SubscriptionInfoBlockRenderer />}

        {atLeastOnePlatformApp && (
          <InstallationGuideConnector
            BlockRenderer={BLOCK_RENDERERS[config.uiConfig.installationGuidesBlockType]}
            hasPlatformApps={hasPlatformApps}
            platform={osToPlatform(os)}
          />
        )}
      </Stack>
    </Box>
  );
}
