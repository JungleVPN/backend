import { useAuthStoreInfo } from '@/store/auth';
import { Loading } from './Loading';

/**
 * TmaAuthGuard — protects routes that require a resolved Telegram identity.
 *
 * Unlike the web AuthGuard (which redirects to /login), TMA has no login page.
 * If the Telegram user is absent, the app shows an inline error rather than
 * redirecting — the user must re-open the Mini App from Telegram to get a
 * fresh initData token.
 *
 * Gate logic:
 *  loading = true  → show loading spinner (auth still resolving)
 *  tgUser = null   → show "open from Telegram" error message
 *  tgUser set      → render children
 */
export function TmaAuthGuard({ children }: { children: React.ReactNode }) {
  const { tgUser, loading } = useAuthStoreInfo();

  if (loading) {
    return <Loading />;
  }

  if (!tgUser) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          textAlign: 'center',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '18px', fontWeight: 600 }}>Open from Telegram</p>
        <p style={{ fontSize: '14px', opacity: 0.6 }}>
          This app must be opened via the JungleVPN bot in Telegram. <br />
          Telegram authentication is not available in a regular browser.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
