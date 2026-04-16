import { Navigate } from 'react-router-dom';
import { useAuthStoreInfo } from '@/store/auth';
import { Loading } from '@/components/Loading/Loading';

/**
 * Route guard that redirects unauthenticated users to /login.
 * Replaces the Next.js middleware auth check.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStoreInfo();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
