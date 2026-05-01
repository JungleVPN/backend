import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import '@workspace/core/core/i18n';
import '@/assets/globals.css';

import { ApiProvider } from '@workspace/core/api';
import { CoreEnvProvider, PaymentsApiProvider } from '@workspace/core/runtime';
import { initDayjs } from '@workspace/core/utils';
import { paymentsApi } from '@/api/payments';
import { backendClient } from '@/api/remnawave';
import { env } from '@/config/env';
import { initTma } from '@/lib/tma-sdk';
import { TmaAuthProvider } from '@/providers/TmaAuthProvider';
import { router } from '@/router';

try {
  initTma();
} catch {}

initDayjs();

const coreRuntimeEnv = {
  subpageConfigUuid: env.subpageConfigUuid,
  allowedAmounts: env.allowedAmounts,
  allowedPeriods: env.allowedPeriods,
  supportUrl: import.meta.env.VITE_SUPPORT_URL ?? '',
  subscriptionPortalPath: '/',
  paymentReturnPath: '/',
  authGateRedirectPath: '/',
  profileSubscriptionPath: '/',
  profilePaymentPath: '/payment',
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CoreEnvProvider value={coreRuntimeEnv}>
      <PaymentsApiProvider api={paymentsApi}>
        <TmaAuthProvider>
          <ApiProvider client={backendClient}>
            <RouterProvider router={router} />
          </ApiProvider>
        </TmaAuthProvider>
      </PaymentsApiProvider>
    </CoreEnvProvider>
  </StrictMode>,
);
