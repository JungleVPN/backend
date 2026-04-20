import { createBrowserRouter } from 'react-router';
import { ProfileLayout } from '@/layouts/ProfileLayout';
import { RootLayout } from '@/layouts/RootLayout';

import GetSubscriptionPage from '@/pages/getSubscription/GetSubscriptionPage';
import ConfirmPage from '@/pages/login/confirm/ConfirmPage';
import LoginPage from '@/pages/login/LoginPage';
import { ProtectedProfileSubscriptionPage } from '@/pages/profile/subscription/protected.tsx';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: GetSubscriptionPage,
      },
      {
        path: '/login',
        Component: LoginPage,
      },
      {
        path: '/login/confirm',
        Component: ConfirmPage,
      },
      {
        path: '/profile',
        Component: ProfileLayout,
        children: [
          {
            path: 'subscription',
            Component: ProtectedProfileSubscriptionPage,
          },
          {
            path: 'payment',
            Component: ConfirmPage,
          },
        ],
      },
      {
        path: '/subscription/:shortUuid',
        Component: SubscriptionPage,
      },
    ],
  },
]);
