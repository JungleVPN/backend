import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useSubscriptionInfoStoreActions, useSubscriptionInfoStoreInfo } from '@workspace/core/stores';
import { TmaAuthGuard } from '@/components/TmaAuthGuard';
import { Loading } from '@/components/Loading';
import { remnawaveApi } from '@/api/remnawave';
import { useAuthStoreInfo } from '@/store/auth';

/**
 * ProfileSubscriptionPage — displays the user's current subscription status.
 *
 * Phase 1: Fetches subscription data directly using the TMA API client and
 *          renders a minimal data view without HeroUI components.
 *
 * Phase 4+: Replace with the shared SubscriptionView component once it is
 *            migrated to packages/core.
 */
export default function ProfileSubscriptionPage() {
  const { rmnUser } = useAuthStoreInfo();
  const { subscription } = useSubscriptionInfoStoreInfo();
  const { setSubscriptionInfo } = useSubscriptionInfoStoreActions();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rmnUser?.shortUuid) return;

    setIsLoading(true);
    remnawaveApi
      .getSubscriptionInfoByShortUuid(rmnUser.shortUuid)
      .then((data) => {
        setSubscriptionInfo({ subscription: { ...data } });
      })
      .catch(() => setError('Failed to load subscription'))
      .finally(() => setIsLoading(false));
  }, [rmnUser?.shortUuid, setSubscriptionInfo]);

  if (isLoading || !rmnUser) {
    return (
      <TmaAuthGuard>
        <Loading />
      </TmaAuthGuard>
    );
  }

  return (
    <TmaAuthGuard>
      <div className='tma-page'>
        <div className='tma-card'>
          <h2 className='tma-title' style={{ fontSize: 20 }}>
            My Subscription
          </h2>

          {error && <p style={{ color: 'var(--tg-theme-destructive-text-color, #EF4444)' }}>{error}</p>}

          {subscription && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <RowItem label='Status' value={subscription.user?.userStatus ?? '—'} />
              <RowItem label='Expires' value={subscription.user?.expiresAt ? new Date(subscription.user.expiresAt).toLocaleDateString() : '—'} />
              <RowItem label='Data limit' value={subscription.user?.trafficLimitBytes ? `${Math.round(Number(subscription.user.trafficLimitBytes) / 1073741824)} GB` : 'Unlimited'} />
            </div>
          )}

          <button
            className='tma-btn-secondary'
            type='button'
            style={{ marginTop: 24 }}
            onClick={() => navigate('/')}
          >
            ← Back
          </button>
        </div>
      </div>
    </TmaAuthGuard>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(128,128,128,0.15)' }}>
      <span style={{ opacity: 0.6, fontSize: 14 }}>{label}</span>
      <span style={{ fontWeight: 500, fontSize: 14 }}>{value}</span>
    </div>
  );
}
