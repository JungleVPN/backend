import { AuthGuard } from '../../../components';
import ProfileSubscriptionPage from './ProfileSubscriptionPage';

export function ProtectedProfileSubscriptionPage() {
  return (
    <AuthGuard>
      <ProfileSubscriptionPage />
    </AuthGuard>
  );
}
