import { createContext, useContext } from 'react';

/**
 * Platform-agnostic user representation.
 * Each platform (TMA, Web) maps its auth data into this shape.
 */
export interface AuthUser {
  id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  logout: () => void | Promise<void>;
}

/**
 * Auth context — each platform provides its own AuthProvider implementation.
 *
 * TMA: validates initData, extracts user from Telegram launch params.
 * Web: uses JWT/session flow with login form.
 *
 * Shared components consume this context and don't care about the source.
 */
export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return auth;
}
