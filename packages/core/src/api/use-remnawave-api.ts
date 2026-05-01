import { useMemo } from 'react';
import { createRemnawaveApi } from './apps/remnawave';
import { useApiClient } from './context';

export function useRemnawaveApi() {
  const client = useApiClient();
  return useMemo(() => createRemnawaveApi(client), [client]);
}
