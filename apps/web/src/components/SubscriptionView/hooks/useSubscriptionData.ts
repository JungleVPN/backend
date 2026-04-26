import { useEffect, useState } from 'react';
import { ApiClientError } from '@workspace/core/api';
import {
  useSubscriptionConfigStoreActions,
  useSubscriptionInfoStoreActions,
} from '@workspace/core/stores';
import { SubscriptionPageRawConfigSchema } from '@workspace/types';
import { remnawaveApi } from '@/api/remnawave';
import { env } from '@/config/env';

type ErrorCode = 'ERR_GET_SUB_LINK' | 'ERR_FATCH_USER' | 'ERR_PARSE_APPCONFIG';

export function useSubscriptionData(shortUuid: string) {
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

    fetchSubscription();
  }, [shortUuid, subscriptionActions]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { config: rawConfig } = await remnawaveApi.getSubscriptionPageConfig(
          env.subpageConfigUuid,
        );
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

    fetchConfig();
  }, [configActions]);

  return { error, isLoading };
}
