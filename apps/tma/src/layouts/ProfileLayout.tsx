import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { useAuthStoreActions, useAuthStoreInfo } from '@/store/auth';
import { initUser } from '@/utils/remnawave';

/**
 * ProfileLayout — shared profile shell for the TMA app.
 *
 * Mirrors apps/web/src/layouts/ProfileLayout.tsx but uses telegramId
 * instead of email to initialise the Remnawave user.
 *
 * Runs initUser({ telegramId }) once when tgUser is available.
 * On success, rmnUser is set in the auth store and protected pages render.
 *
 * Note: There is no bottom <Navbar> in Phase 1. TMA navigation is handled
 * by the Telegram BackButton (Phase 3) and in-page navigation elements.
 */
export function ProfileLayout() {
  const { tgUser } = useAuthStoreInfo();
  const { setRmnUser } = useAuthStoreActions();

  useEffect(() => {
    if (!tgUser?.id) return;

    initUser(tgUser.id)
      .then((user) => setRmnUser(user ?? null))
      .catch(console.error);
  }, [tgUser?.id, setRmnUser]);

  return <Outlet />;
}
