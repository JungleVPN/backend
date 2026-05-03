import { useEffect } from 'react';
import { usePaymentsApi } from '../runtime';
import { useSavedMethodsStore } from '../stores';

/**
 * Module-level set tracks in-flight requests so multiple hook instances
 * (e.g. ProfileLayout + PaymentPage) never fire duplicate requests for
 * the same user.
 */
const pendingUserIds = new Set<string>();

/**
 * Pre-fetches saved payment methods for the given userId and writes them into
 * the shared saved-methods store.
 *
 * All store reads and writes are done via `useSavedMethodsStore.getState()`
 * inside the effect — NOT as reactive deps — so the effect never re-runs
 * because of store updates and cannot produce an update-depth loop.
 */
export function useSavedMethodsData(userId: string): void {
  const paymentsApi = usePaymentsApi();

  useEffect(() => {
    if (!userId) return;
    // All store access is via getState() — never reactive deps.
    if (useSavedMethodsStore.getState().savedMethods !== null) return;
    if (pendingUserIds.has(userId)) return;

    pendingUserIds.add(userId);

    paymentsApi
      .getSavedMethods(userId)
      .then((methods) => useSavedMethodsStore.getState().actions.setSavedMethods(methods))
      .catch((err) => console.error('Failed to pre-fetch saved methods:', err))
      .finally(() => pendingUserIds.delete(userId));
  }, [userId, paymentsApi]);
}
