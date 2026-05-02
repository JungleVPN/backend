import {
  ProfileLayout,
  ProtectedPaymentPage,
  ProtectedProfileSubscriptionPage,
  SubscriptionPage,
  TermsPage,
} from '@workspace/core';
import { createMemoryRouter } from 'react-router';
import { TmaRootLayout } from '@/layouts/TmaRootLayout';

/**
 * TMA uses createMemoryRouter (no URL bar). Routes mirror web profile/terms/subscription
 * under the root layout; paths are relative to `/`.
 */
export const router = createMemoryRouter(
  [
    {
      Component: TmaRootLayout,
      children: [
        {
          Component: ProfileLayout,
          children: [
            {
              index: true,
              Component: ProtectedProfileSubscriptionPage,
            },
            {
              path: 'payments',
              Component: ProtectedPaymentPage,
            },

            {
              path: 'subscription/:shortUuid',
              Component: SubscriptionPage,
            },
          ],
        },
        {
          path: 'terms',
          Component: TermsPage,
        },
      ],
    },
  ],
  {
    initialEntries: ['/'],
    initialIndex: 0,
  },
);
