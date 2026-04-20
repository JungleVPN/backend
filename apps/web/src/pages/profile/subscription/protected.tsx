import { AuthGuard } from '@/components/AuthGuard/AuthGuard.tsx';
import ProfileSubscriptionPage from '@/pages/profile/subscription/ProfileSubscriptionPage.tsx';

export const ProtectedProfileSubscriptionPage = () => (
  <AuthGuard>
    <ProfileSubscriptionPage />
  </AuthGuard>
);
