import { useEffect, useState } from 'react';
import { ApiClientError } from '../api';
import { useRemnawaveApi } from '../api/use-remnawave-api';
import {
  useSubscriptionConfigStore,
  useSubscriptionConfigStoreActions,
} from '../stores/subscription-config';
import {
  useSubscriptionInfoStore,
  useSubscriptionInfoStoreActions,
} from '../stores/subscription-info';
import { SubscriptionPageRawConfigSchema } from '@workspace/types';

export type SubscriptionDataError =
  | 'ERR_GET_SUB_LINK'
  | 'ERR_FATCH_USER'
  | 'ERR_PARSE_APPCONFIG';

/**
 * Module-level sets track in-flight requests so that multiple hook instances
 * (e.g. ProfileLayout + SubscriptionView) never fire duplicate requests for
 * the same UUID.
 */
const pendingShortUuids = new Set<string>();
const pendingConfigUuids = new Set<string>();

/**
 * Fetches subscription info and page config for the given UUIDs and writes
 * the results into the shared Zustand stores.
 *
 * Guard state is read from `store.getState()` *inside* each effect rather than
 * as reactive deps — this avoids a re-render → re-run → re-render loop that
 * would occur if store selectors were included in the dependency arrays.
 */
export function useSubscriptionData(shortUuid: string, subpageConfigUuid: string) {
  const remnawaveApi = useRemnawaveApi();
  const subscriptionActions = useSubscriptionInfoStoreActions();
  const configActions = useSubscriptionConfigStoreActions();

  const [error, setError] = useState<SubscriptionDataError | null>(null);

  useEffect(() => {
    if (!shortUuid) return;
    // Read guard state synchronously from the store snapshot — NOT a reactive dep.
    if (useSubscriptionInfoStore.getState().subscription) return;
    if (pendingShortUuids.has(shortUuid)) return;

    pendingShortUuids.add(shortUuid);

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
        pendingShortUuids.delete(shortUuid);
      }
    };

    void fetchSubscription();
  }, [shortUuid, remnawaveApi, subscriptionActions]);

  useEffect(() => {
    if (!subpageConfigUuid) return;
    // Read guard state synchronously from the store snapshot — NOT a reactive dep.
    if (useSubscriptionConfigStore.getState().isConfigLoaded) return;
    if (pendingConfigUuids.has(subpageConfigUuid)) return;

    pendingConfigUuids.add(subpageConfigUuid);

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
      } finally {
        pendingConfigUuids.delete(subpageConfigUuid);
      }
    };

    void fetchConfig();
  }, [subpageConfigUuid, remnawaveApi, configActions]);

  return { error };
}
