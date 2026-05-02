import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import '@workspace/core/core/i18n';
import '@/assets/globals.css';

import { retrieveLaunchParams } from '@tma.js/sdk-react';
import { ApiProvider } from '@workspace/core/api';
import {
  CoreEnvProvider,
  PaymentsApiProvider,
  RemnawaveApiProvider,
} from '@workspace/core/runtime';
import { initDayjs } from '@workspace/core/utils';
import { paymentsApi } from '@/api/payments';
import { backendClient, remnawaveApi } from '@/api/remnawave';
import { env } from '@/config/env';
import { initTma } from '@/lib/tma-sdk';
import { TmaAuthProvider } from '@/providers/TmaAuthProvider';
import { TmaProvider } from '@/providers/TmaProvider';
import { router } from '@/router';

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

const root = document.getElementById('root');
if (!root) {
  throw new Error('Missing #root element');
}

try {
  const launchParams = retrieveLaunchParams();
  const { tgWebAppPlatform: platform } = launchParams;
  const debug = (launchParams.tgWebAppStartParam || '').includes('debug') || import.meta.env.DEV;

  // Configure all application dependencies.
  await initTma({
    debug,
    eruda: debug && ['ios', 'android'].includes(platform),
    mockForMacOS: platform === 'macos',
  }).then(() => {
    createRoot(root).render(
      <StrictMode>
        <CoreEnvProvider value={coreRuntimeEnv}>
          <RemnawaveApiProvider api={remnawaveApi}>
            <PaymentsApiProvider api={paymentsApi}>
              <TmaAuthProvider>
                <TmaProvider>
                  <ApiProvider client={backendClient}>
                    <RouterProvider router={router} />
                  </ApiProvider>
                </TmaProvider>
              </TmaAuthProvider>
            </PaymentsApiProvider>
          </RemnawaveApiProvider>
        </CoreEnvProvider>
      </StrictMode>,
    );
  });
} catch (e) {
  createRoot(root).render(<div>ERROR</div>);
}
