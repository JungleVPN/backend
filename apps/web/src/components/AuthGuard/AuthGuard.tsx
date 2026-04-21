import { Navigate } from 'react-router';
import { Loading } from '@/components/Loading/Loading';
import { useAuthStoreInfo } from '@/store/auth';

/**
 * Route guard that redirects unauthenticated users to /login.
 * Replaces the Next.js middleware auth check.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { authUser, loading } = useAuthStoreInfo();

  if (loading) {
    return <Loading />;
  }

  if (!authUser) {
    return <Navigate to='/login' replace />;
  }

  return <>{children}</>;
}
