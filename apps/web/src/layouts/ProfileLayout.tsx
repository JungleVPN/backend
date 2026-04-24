import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { Navbar } from '@/components/Tabs/Tabs';
import { useAuthStoreActions, useAuthStoreInfo } from '@/store/auth';
import { initUser } from '@/utils/remnawave';

export function ProfileLayout() {
  const { authUser } = useAuthStoreInfo();
  const { setRmnUser } = useAuthStoreActions();

  useEffect(() => {
    const email = authUser?.email;
    if (!email) return;

    initUser({ email })
      .then((user) => setRmnUser(user ?? null))
      .catch(console.error);
  }, [authUser?.email, setRmnUser]);

  return (
    <>
      <Outlet />
      <Navbar />
    </>
  );
}
