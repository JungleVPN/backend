import { Loading, SubscriptionView } from '../../../components';
import { useCoreEnv } from '../../../runtime';
import { useAuthStoreInfo } from '../../../stores';

export default function ProfileSubscriptionPage() {
  const { subpageConfigUuid } = useCoreEnv();
  const { rmnUser } = useAuthStoreInfo();

  if (!rmnUser) {
    return <Loading />;
  }

  return <SubscriptionView shortUuid={rmnUser.shortUuid} subpageConfigUuid={subpageConfigUuid} />;
}
