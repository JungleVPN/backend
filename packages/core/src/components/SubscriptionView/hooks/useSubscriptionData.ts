import { useEffect, useState } from 'react';
import { ApiClientError, createRemnawaveApi, useApiClient } from '../../../api';
import { useSubscriptionConfigStoreActions } from '../../../stores/subscription-config';
import { useSubscriptionInfoStoreActions } from '../../../stores/subscription-info';
import { SubscriptionPageRawConfigSchema } from '@workspace/types';

type ErrorCode = 'ERR_GET_SUB_LINK' | 'ERR_FATCH_USER' | 'ERR_PARSE_APPCONFIG';

/**
 * Fetches subscription info and page config for a given shortUuid.
 *
 * @param shortUuid          - The user's subscription short UUID.
 * @param subpageConfigUuid  - The page-config UUID from the app's env.
 *                             Each app provides this because the UUID differs
 *                             per deployment (env var on web, hardcoded on TMA).
 */
export function useSubscriptionData(shortUuid: string, subpageConfigUuid: string) {
  const client = useApiClient();

  const subscriptionActions = useSubscriptionInfoStoreActions();
  const configActions = useSubscriptionConfigStoreActions();

  const [error, setError] = useState<ErrorCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shortUuid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const remnawaveApi = createRemnawaveApi(client);

    const fetchSubscription = async () => {
      try {
        const subscriptionInfo = await remnawaveApi.getSubscriptionInfoByShortUuid(shortUuid);
        subscriptionActions.setSubscriptionInfo({ subscription: { ...subscriptionInfo } });
      } catch (err) {
        setError(
          err instanceof ApiClientError && err.status === 404
            ? 'ERR_GET_SUB_LINK'
            : 'ERR_FATCH_USER',
        );
        console.error('Failed to fetch subscription:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchSubscription();
  }, [shortUuid, client, subscriptionActions]);

  useEffect(() => {
    if (!subpageConfigUuid) return;

    const remnawaveApi = createRemnawaveApi(client);

    const fetchConfig = async () => {
      try {
        const { config: rawConfig } =
          await remnawaveApi.getSubscriptionPageConfig(subpageConfigUuid);
        const parsed = await SubscriptionPageRawConfigSchema.safeParseAsync(rawConfig);
        if (!parsed.success) {
          setError('ERR_PARSE_APPCONFIG');
          return;
        }
        configActions.setConfig(parsed.data);
      } catch {
        setError('ERR_PARSE_APPCONFIG');
      }
    };

    void fetchConfig();
  }, [subpageConfigUuid, client, configActions]);

  return { error, isLoading };
}
