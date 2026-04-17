import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTrialUser, remnawaveApi } from '@/api/instance';
import { Loading } from '@/components/Loading/Loading';
import { SubscriptionView } from '@/components/SubscriptionView/SubscriptionView';
import { useAuthStoreInfo } from '@/store/auth';

export default function ProfileSubscriptionPage() {
  const { user, loading: authLoading } = useAuthStoreInfo();
  const navigate = useNavigate();
  const [shortUuid, setShortUuid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user?.email) {
      navigate('/login');
      return;
    }

    const fetchOrCreate = async () => {
      try {
        const existingUsers = await remnawaveApi.getUserByEmail(user.email!);

        if (existingUsers && existingUsers.length > 0) {
          setShortUuid(existingUsers[0].shortUuid);
        } else {
          const newUser = await createTrialUser(user.email!);
          setShortUuid(newUser.shortUuid);
        }
      } catch (error) {
        console.error('Failed to get/create user:', error);
        navigate('/login?message=Failed to retrieve or create user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreate();
  }, [user, authLoading, navigate]);

  if (authLoading || loading || !shortUuid) {
    return <Loading />;
  }

  return <SubscriptionView shortUuid={shortUuid} />;
}
