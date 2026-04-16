import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthUser } from '@workspace/core/hooks';
import { createStorage } from '@workspace/core/utils';

const storage = createStorage('jv-web');

/**
 * Web-specific auth provider.
 * Uses JWT tokens stored in localStorage.
 * Replace the login/logout logic with your actual auth flow.
 */
export function WebAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = storage.get<string>('token', '');
    const savedUser = storage.get<AuthUser | null>('user', null);

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    storage.remove('token');
    storage.remove('user');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!token,
      isLoading,
      token,
      logout,
    }),
    [user, token, isLoading, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
