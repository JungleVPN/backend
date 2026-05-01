import { Surface } from '@heroui/react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { SubscriptionView } from '../../components';
import { useCoreEnv } from '../../runtime';
import { useAuthStoreInfo } from '../../stores';

export default function SubscriptionPage() {
  const { subpageConfigUuid, subscriptionPortalPath } = useCoreEnv();
  const navigate = useNavigate();
  const { shortUuid } = useParams<{ shortUuid: string }>();

  const { authUser, tgUser } = useAuthStoreInfo();

  useEffect(() => {
    if (authUser || tgUser) navigate(subscriptionPortalPath);
  }, [authUser, tgUser, navigate, subscriptionPortalPath]);

  if (!shortUuid) {
    return null;
  }

  return (
    <Surface variant='transparent'>
      <SubscriptionView shortUuid={shortUuid} subpageConfigUuid={subpageConfigUuid} />
    </Surface>
  );
}
