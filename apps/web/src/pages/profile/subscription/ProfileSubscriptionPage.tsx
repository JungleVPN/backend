import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStoreInfo } from '@/store/auth';
import { getUser } from '@/api/getUser';
import { createUser } from '@/api/createUser';
import { SubscriptionView } from '@/components/SubscriptionView/SubscriptionView';
import { Loading } from '@/components/Loading/Loading';

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
        const existingUsers = await getUser(user.email!);

        if (existingUsers && existingUsers.length > 0) {
          setShortUuid(existingUsers[0].shortUuid);
        } else {
          const newUser = await createUser(user.email!);
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
