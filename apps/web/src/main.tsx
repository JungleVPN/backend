import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import '@workspace/core/core/i18n';
import '@/assets/globals.css';

import { ApiProvider } from '@workspace/core/api';
import { CoreEnvProvider, PaymentsApiProvider, SupabaseProvider } from '@workspace/core/runtime';
import { initDayjs } from '@workspace/core/utils';
import { paymentsApi } from '@/api/payments';
import { backendClient } from '@/api/remnawave';
import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/client';
import { WebAuthProvider } from '@/providers/WebAuthProvider';
import { router } from '@/router.ts';

initDayjs();

const coreRuntimeEnv = {
  subpageConfigUuid: env.subpageConfigUuid ?? '',
  allowedAmounts: env.allowedAmounts ?? '',
  allowedPeriods: env.allowedPeriods,
  supportUrl: import.meta.env.VITE_SUPPORT_URL ?? '',
  subscriptionPortalPath: '/profile/subscription',
  paymentReturnPath: '/profile/subscription',
  authGateRedirectPath: '/login',
  profileSubscriptionPath: '/profile/subscription',
  profilePaymentPath: '/profile/payments',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CoreEnvProvider value={coreRuntimeEnv}>
      <PaymentsApiProvider api={paymentsApi}>
        <SupabaseProvider getClient={createClient}>
          <WebAuthProvider>
            <ApiProvider client={backendClient}>
              <RouterProvider router={router} />
            </ApiProvider>
          </WebAuthProvider>
        </SupabaseProvider>
      </PaymentsApiProvider>
    </CoreEnvProvider>
  </StrictMode>,
);
