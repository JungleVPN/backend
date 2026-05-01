import { ProfileLayout, RootLayout } from '@workspace/core';
import {
  ConfirmPage,
  GetSubscriptionPage,
  LoginPage,
  ProtectedPaymentPage,
  ProtectedProfileSubscriptionPage,
  SubscriptionPage,
  TermsPage,
} from '@workspace/core/pages';
import { createBrowserRouter } from 'react-router';

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
            Component: ProtectedPaymentPage,
          },
        ],
      },
      {
        path: '/subscription/:shortUuid',
        Component: SubscriptionPage,
      },
      {
        path: '/terms',
        Component: TermsPage,
      },
    ],
  },
]);
