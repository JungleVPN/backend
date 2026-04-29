import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStoreActions } from '@/store/auth';

/**
 * Client-side auth provider.
 * Listens for Supabase auth state changes and updates the Zustand auth store.
 * No server-side session — auth is fully client-side.
 *
 * Sets authSource = 'web' whenever a Supabase session is resolved.
 * This allows shared components to branch on authSource when needed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuthUser, setAuthSource, setLoading } = useAuthStoreActions();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      setAuthSource(session?.user ? 'web' : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthSource(session?.user ? 'web' : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, setAuthUser, setAuthSource, setLoading]);

  return <>{children}</>;
}
