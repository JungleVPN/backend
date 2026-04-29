import { useNavigate } from 'react-router';
import { TmaAuthGuard } from '@/components/TmaAuthGuard';

/**
 * PaymentPage — Phase 1 placeholder.
 *
 * Full payment flow will be implemented in Phase 2+ when:
 *  - The TMA API client sends validated X-Telegram-Init-Data headers
 *  - Payment sessions can be created with proper auth
 *  - WebApp.openLink() is wired into the PlatformAdapter (Phase 5)
 *    to open the YooKassa payment URL without breaking the TMA session.
 */
export default function PaymentPage() {
  const navigate = useNavigate();

  return (
    <TmaAuthGuard>
      <div className='tma-page'>
        <div className='tma-card'>
          <h2 className='tma-title' style={{ fontSize: 20 }}>
            Payment
          </h2>
          <p style={{ marginTop: 12, opacity: 0.6, fontSize: 14 }}>
            Payment functionality is coming in the next update.
          </p>
          <button
            className='tma-btn-secondary'
            type='button'
            style={{ marginTop: 24 }}
            onClick={() => navigate('/profile/subscription')}
          >
            ← Back to Subscription
          </button>
        </div>
      </div>
    </TmaAuthGuard>
  );
}
