import { useCallback } from 'react';
import type { createPaymentsApi } from '../api';
import { useAsync } from './use-async';

type PaymentsApi = ReturnType<typeof createPaymentsApi>;

/**
 * Fetches the list of active saved payment methods for a user.
 *
 * Usage:
 *   const { data, isLoading, execute } = useSavedMethods(paymentsApi);
 *   useEffect(() => { execute(userId); }, [userId]);
 */
export function useSavedMethods(api: PaymentsApi) {
  const fn = useCallback((userId: string) => api.getSavedMethods(userId), [api]);
  return useAsync(fn);
}

/**
 * Creates a new YooKassa payment session.
 * On success `execute` returns a `PaymentSession` with a redirect `url`.
 *
 * Usage:
 *   const { isLoading, execute } = useCreatePaymentSession(paymentsApi);
 *   const session = await execute(dto);
 *   if (session) window.location.href = session.url;
 */
export function useCreatePaymentSession(api: PaymentsApi) {
  const fn = useCallback(
    (dto: Parameters<PaymentsApi['createYookassaSession']>[0]) => api.createYookassaSession(dto),
    [api],
  );
  return useAsync(fn);
}

/**
 * Deletes a saved payment method by id.
 * Call `execute(userId, id)`, then refetch the methods list on success.
 */
export function useDeleteSavedMethod(api: PaymentsApi) {
  const fn = useCallback(
    (userId: string, id: string) => api.deleteSavedMethod(userId, id),
    [api],
  );
  return useAsync(fn);
}
