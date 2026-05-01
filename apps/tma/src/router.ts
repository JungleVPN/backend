import {
  ProfileLayout,
  ProtectedPaymentPage,
  ProtectedProfileSubscriptionPage,
  RootLayout,
  SubscriptionPage,
  TermsPage,
} from '@workspace/core';
import { createMemoryRouter } from 'react-router';

/**
 * TMA uses createMemoryRouter (no URL bar). Routes mirror web profile/terms/subscription
 * under the root layout; paths are relative to `/`.
 */
export const router = createMemoryRouter(
  [
    {
      Component: RootLayout,
      children: [
        {
          Component: ProfileLayout,
          children: [
            {
              index: true,
              Component: ProtectedProfileSubscriptionPage,
            },
            {
              path: 'payment',
              Component: ProtectedPaymentPage,
            },
            {
              path: 'terms',
              Component: TermsPage,
            },
            {
              path: 'subscription/:shortUuid',
              Component: SubscriptionPage,
            },
          ],
        },
      ],
    },
  ],
  {
    initialEntries: ['/'],
    initialIndex: 0,
  },
);
