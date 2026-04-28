import { Surface } from '@heroui/react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SubscriptionView } from '@/components/SubscriptionView/SubscriptionView';
import { useAuthStoreInfo } from '@/store/auth';

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { shortUuid } = useParams<{ shortUuid: string }>();

  const { authUser } = useAuthStoreInfo();

  useEffect(() => {
    if (authUser) navigate('/profile/subscription');
  }, [authUser, navigate]);

  if (!shortUuid) {
    return null;
  }

  return (
    <Surface variant='transparent'>
      <SubscriptionView shortUuid={shortUuid} />
    </Surface>
  );
}
