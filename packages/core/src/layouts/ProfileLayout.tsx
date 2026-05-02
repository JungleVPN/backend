import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useRemnawaveApi } from '../api';
import { Navbar } from '../components';
import { useSubscriptionData } from '../hooks';
import { useCoreEnv } from '../runtime';
import { useAuthStoreActions, useAuthStoreInfo } from '../stores';
import { initUser } from '../utils';

export function ProfileLayout() {
  const { subpageConfigUuid } = useCoreEnv();
  const remnawaveApi = useRemnawaveApi();
  const { tgUser, authUser, rmnUser } = useAuthStoreInfo();
  const { setRmnUser } = useAuthStoreActions();

  // Resolve or create the remnawave user once auth identifiers are available.
  useEffect(() => {
    initUser(remnawaveApi, { email: authUser?.email, telegramId: tgUser?.id })
      .then((user) => setRmnUser(user ?? null))
      .catch(console.error);
  }, [authUser?.email, remnawaveApi, setRmnUser, tgUser?.id]);

  // Pre-fetch both subscription and saved payment methods as soon as rmnUser
  // is known so child routes render immediately without a loading flash on
  // subsequent navigations.
  useSubscriptionData(rmnUser?.shortUuid ?? '', subpageConfigUuid);

  return (
    <>
      <Outlet />
      <Navbar />
    </>
  );
}
