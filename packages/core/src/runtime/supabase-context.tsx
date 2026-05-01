import { createContext, type ReactNode, useContext } from 'react';

import type { SupabaseAuthClient } from './supabase-auth-types';

export type SupabaseClientGetter = () => SupabaseAuthClient;

const SupabaseContext = createContext<SupabaseClientGetter | null>(null);

export function SupabaseProvider({
  getClient,
  children,
}: {
  getClient: SupabaseClientGetter;
  children: ReactNode;
}) {
  return <SupabaseContext.Provider value={getClient}>{children}</SupabaseContext.Provider>;
}

export function useSupabaseClient(): SupabaseAuthClient {
  const get = useContext(SupabaseContext);
  if (!get) {
    throw new Error('SupabaseProvider is required for web login pages');
  }
  return get();
}
