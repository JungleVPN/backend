import { Loading } from '@/components/Loading/Loading';
import { SubscriptionView } from '@/components/SubscriptionView/SubscriptionView';
import { useAuthStoreInfo } from '@/store/auth';

export default function ProfileSubscriptionPage() {
  const { rmnUser } = useAuthStoreInfo();

  if (!rmnUser) {
    return <Loading />;
  }

  return <SubscriptionView shortUuid={rmnUser.shortUuid} />;
}
