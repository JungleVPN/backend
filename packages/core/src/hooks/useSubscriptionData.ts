import { SubscriptionPageRawConfigSchema } from '@workspace/types';
import { useEffect, useState } from 'react';
import { ApiClientError, useRemnawaveApi } from '../api';
import { useSubscriptionConfigStore, useSubscriptionInfoStore } from '../stores';

export type SubscriptionDataError = 'ERR_GET_SUB_LINK' | 'ERR_FATCH_USER' | 'ERR_PARSE_APPCONFIG';

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
/**
 * Fetches subscription info and page config for the given UUIDs and writes
 * the results into the shared Zustand stores.
 *
 * All store reads and writes happen via `store.getState()` inside each effect —
 * never as reactive deps — so the effects cannot be re-triggered by their own
 * store writes and cannot produce an update-depth loop.
 */
export function useSubscriptionData(shortUuid: string, subpageConfigUuid: string) {
  const remnawaveApi = useRemnawaveApi();

  const [error, setError] = useState<SubscriptionDataError | null>(null);

  useEffect(() => {
    if (!shortUuid) return;
    // All store access via getState() — never reactive deps.
    if (useSubscriptionInfoStore.getState().subscription) return;
    if (pendingShortUuids.has(shortUuid)) return;

    pendingShortUuids.add(shortUuid);

    const fetchSubscription = async () => {
      try {
        const subscriptionInfo = await remnawaveApi.getSubscriptionInfoByShortUuid(shortUuid);
        useSubscriptionInfoStore
          .getState()
          .actions.setSubscriptionInfo({ subscription: { ...subscriptionInfo } });
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
  }, [shortUuid, remnawaveApi]);

  useEffect(() => {
    if (!subpageConfigUuid) return;
    // All store access via getState() — never reactive deps.
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
        useSubscriptionConfigStore.getState().actions.setConfig(parsed.data);
      } catch {
        setError('ERR_PARSE_APPCONFIG');
      } finally {
        pendingConfigUuids.delete(subpageConfigUuid);
      }
    };

    void fetchConfig();
  }, [subpageConfigUuid, remnawaveApi]);

  return { error };
}
