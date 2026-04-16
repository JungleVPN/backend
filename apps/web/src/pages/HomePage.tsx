import { APP_NAME } from '@workspace/core/constants';
import { EmptyState } from '@workspace/ui';

export function HomePage() {
  return (
    <EmptyState
      title={`Welcome to ${APP_NAME}`}
      description="Your VPN management dashboard. Get started by navigating to the dashboard."
    />
  );
}
