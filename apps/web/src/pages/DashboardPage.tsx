import { useAuth } from '@workspace/core/hooks';
import { EmptyState, Spinner } from '@workspace/ui';

export function DashboardPage() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--jv-space-xl)' }}>
        <Spinner size={32} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sign in to continue"
        description="You need to be authenticated to view the dashboard."
      />
    );
  }

  return (
    <div>
      <h2 style={{ margin: 0, marginBottom: 'var(--jv-space-md)' }}>
        Dashboard
      </h2>
      <p style={{ color: 'var(--jv-color-text-secondary)' }}>
        Welcome back, {user?.firstName || user?.username || 'User'}
      </p>
    </div>
  );
}
