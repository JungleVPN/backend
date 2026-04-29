import { useNavigate } from 'react-router';
import { TmaAuthGuard } from '@/components/TmaAuthGuard';
import { useAuthStoreInfo } from '@/store/auth';

/**
 * Home page — the first screen the user sees after TMA auth resolves.
 *
 * Phase 1: Shows a welcome card with the user's Telegram name and a
 * button to navigate to their subscription.
 *
 * Phase 4: Replace inline styles with Tailwind/HeroUI once shared
 * component migration is complete.
 */
export default function HomePage() {
  const { tgUser } = useAuthStoreInfo();
  const navigate = useNavigate();

  return (
    <TmaAuthGuard>
      <div className='tma-page'>
        <div className='tma-card'>
          <p className='tma-label'>Welcome to</p>
          <h1 className='tma-title'>JungleVPN</h1>

          {tgUser && (
            <p className='tma-subtitle'>
              Hello, <strong>{tgUser.first_name}</strong>
              {tgUser.last_name ? ` ${tgUser.last_name}` : ''}
              {tgUser.username ? ` (@${tgUser.username})` : ''}
            </p>
          )}

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className='tma-btn-primary'
              type='button'
              onClick={() => navigate('/profile/subscription')}
            >
              My Subscription
            </button>
          </div>
        </div>
      </div>
    </TmaAuthGuard>
  );
}
