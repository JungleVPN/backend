import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStoreActions } from '@/store/auth';

/**
 * Client-side auth provider.
 * Listens for Supabase auth state changes and updates the Zustand auth store.
 * No server-side session — auth is fully client-side.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStoreActions();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, setUser, setLoading]);

  return <>{children}</>;
}
