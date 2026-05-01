import { useAuthStoreActions } from '@workspace/core/stores';
import { type ReactNode, useEffect } from 'react';

import { createClient } from '@/lib/supabase/client';

/**
 * Web-only: Supabase session → shared auth store.
 */
export function WebAuthProvider({ children }: { children: ReactNode }) {
  const { setAuthUser, setAuthSource, setLoading } = useAuthStoreActions();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user;
      setAuthUser(user ? { id: user.id, email: user.email } : null);
      setAuthSource(user ? 'web' : null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setAuthUser(user ? { id: user.id, email: user.email } : null);
      setAuthSource(user ? 'web' : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, setAuthUser, setAuthSource, setLoading]);

  return <>{children}</>;
}
