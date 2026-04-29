import { createMemoryRouter } from 'react-router';
import { ProfileLayout } from '@/layouts/ProfileLayout';
import { RootLayout } from '@/layouts/RootLayout';

import HomePage from '@/pages/home/HomePage';
import PaymentPage from '@/pages/profile/payment/PaymentPage';
import ProfileSubscriptionPage from '@/pages/profile/subscription/ProfileSubscriptionPage';

/**
 * TMA router uses createMemoryRouter instead of createBrowserRouter.
 *
 * Reasons:
 *  1. Telegram Mini Apps have no URL bar — the user never sees or types URLs.
 *  2. Telegram does not preserve URL state across restarts, so browser history
 *     would be wiped every time the app is reopened.
 *  3. Memory router keeps full navigation history in-process, enabling correct
 *     back/forward behaviour via Telegram's BackButton (Phase 3).
 *
 * The route definitions mirror apps/web/src/router.ts where relevant.
 * Routes that only make sense on web (/login, /login/confirm) are omitted.
 *
 * Deep linking via start_param (e.g. ?startapp=sub_UUID) is handled in
 * TmaAuthProvider (Phase 3) by programmatically navigating after auth resolves.
 */
export const router = createMemoryRouter(
  [
    {
      Component: RootLayout,
      children: [
        {
          index: true,
          Component: HomePage,
        },
        {
          path: 'profile',
          Component: ProfileLayout,
          children: [
            {
              path: 'subscription',
              Component: ProfileSubscriptionPage,
            },
            {
              path: 'payment',
              Component: PaymentPage,
            },
          ],
        },
      ],
    },
  ],
  {
    // Start at the root — home page
    initialEntries: ['/'],
    initialIndex: 0,
  },
);
