import { createContext, type ReactNode, useContext } from 'react';
import { type ApiClient } from './client';

const ApiClientContext = createContext<ApiClient | null>(null);

export interface ApiProviderProps {
  client: ApiClient;
  children: ReactNode;
}

export function ApiProvider({ client, children }: ApiProviderProps) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (!client) {
    throw new Error('useApiClient must be used within an <ApiProvider>');
  }
  return client;
}
