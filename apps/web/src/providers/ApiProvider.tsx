import { useMemo, type ReactNode } from 'react';
import { createApiClient, ApiProvider } from '@workspace/core/api';
import { useAuth } from '@workspace/core/hooks';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Web-specific API provider.
 * Injects the JWT token from web auth into every request.
 */
export function WebApiProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();

  const client = useMemo(
    () =>
      createApiClient({
        baseUrl: API_BASE_URL,
        getHeaders: () => {
          const headers: Record<string, string> = {};
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
          return headers;
        },
      }),
    [token],
  );

  return <ApiProvider client={client}>{children}</ApiProvider>;
}
