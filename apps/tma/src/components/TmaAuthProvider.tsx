import { miniApp, retrieveLaunchParams, themeParams, viewport } from '@tma.js/sdk-react';
import { useEffect } from 'react';
import { tmaSDK } from '@/lib/tma-sdk';
import { useAuthStoreActions } from '@/store/auth';

/**
 * TmaAuthProvider — Phase 1 stub.
 *
 * Reads the Telegram user from initDataUnsafe (NOT cryptographically validated).
 * This is intentionally unsafe at Phase 1:
 *  - The Telegram user is used only for display and for calling initUser(),
 *    which creates/finds a Remnawave user (low-trust operation).
 *  - The backend does NOT grant elevated access based on this data alone.
 *  - Phase 2 replaces this with a POST /auth/tma/validate call that verifies
 *    the HMAC-SHA256 hash before any user data is trusted.
 *
 * Behaviour when not in Telegram (browser dev):
 *  - tgUser remains null, loading is set to false.
 *  - TmaAuthGuard will render an error state — expected in dev without TMA.
 */
export function TmaAuthProvider({ children }: { children: React.ReactNode }) {
  const { setTgUser, setAuthSource, setTgInitDataRaw, setLoading } = useAuthStoreActions();

  useEffect(() => {
    tmaSDK.init();
    const launchParams = retrieveLaunchParams();
    const { tgWebAppPlatform: platform, tgWebAppData } = launchParams;
    console.log(launchParams);

    if (miniApp.mount.isAvailable()) {
      themeParams.mount();
      miniApp.mount();
      // themeParams.bindCssVars();
    }

    // if (viewport.mount.isAvailable()) {
    //   viewport.mount().then(() => {
    //     viewport.bindCssVars();
    //   });
    // }
    const unsafeUser = tmaSDK.getUnsafeUser();
    const initDataRaw = tmaSDK.getInitDataRaw();
    console.log(unsafeUser);
    // Phase 1: trust initDataUnsafe for display/identity resolution only
    setTgUser(tgWebAppData?.user);
    setAuthSource('telegram');
    // Store initData raw so the API client can send it as a header
    setTgInitDataRaw(initDataRaw || null);

    // Auth resolution is synchronous in Phase 1 — no async needed
    setLoading(false);
  }, [setTgUser, setAuthSource, setTgInitDataRaw, setLoading]);

  return <>{children}</>;
}
