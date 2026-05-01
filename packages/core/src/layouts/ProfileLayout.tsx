import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useRemnawaveApi } from '../api';
import { Navbar } from '../components';
import { useAuthStoreActions, useAuthStoreInfo } from '../stores';
import { initUser } from '../utils';

export function ProfileLayout() {
  const remnawaveApi = useRemnawaveApi();
  const { tgUser } = useAuthStoreInfo();
  const { authUser } = useAuthStoreInfo();
  const { setRmnUser } = useAuthStoreActions();

  useEffect(() => {
    const telegramId = tgUser?.id;
    const email = authUser?.email;

    initUser(remnawaveApi, { email, telegramId })
      .then((user) => setRmnUser(user ?? null))
      .catch(console.error);
  }, [authUser?.email, remnawaveApi, setRmnUser, tgUser?.id]);

  return (
    <>
      <Outlet />
      <Navbar />
    </>
  );
}
