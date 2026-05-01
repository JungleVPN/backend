import { createContext, type ReactNode, useContext } from 'react';
import type { createPaymentsApi } from '../api';

export type PaymentsApi = ReturnType<typeof createPaymentsApi>;

const PaymentsApiContext = createContext<PaymentsApi | null>(null);

export function PaymentsApiProvider({ api, children }: { api: PaymentsApi; children: ReactNode }) {
  return <PaymentsApiContext.Provider value={api}>{children}</PaymentsApiContext.Provider>;
}

export function usePaymentsApi(): PaymentsApi {
  const api = useContext(PaymentsApiContext);
  if (!api) {
    throw new Error('PaymentsApiProvider is required for payment flows');
  }
  return api;
}
