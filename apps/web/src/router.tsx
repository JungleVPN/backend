import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard/AuthGuard';
import { RootLayout } from '@/layouts/RootLayout';

import GetSubscriptionPage from '@/pages/getSubscription/GetSubscriptionPage';
import ConfirmPage from '@/pages/login/confirm/ConfirmPage';
import LoginPage from '@/pages/login/LoginPage';
import ProfileSubscriptionPage from '@/pages/profile/subscription/ProfileSubscriptionPage';
import SubscriptionPage from '@/pages/subscription/SubscriptionPage';

/**
 * Application routes.
 *
 * Route mapping from Next.js (old) → React Router (new):
 *   /account/getSubscription           → /
 *   /account/login                     → /login
 *   /account/login/confirm             → /login/confirm
 *   /account/profile/subscription      → /profile/subscription  (auth-guarded)
 *   /account/subscription/:shortUuid   → /subscription/:shortUuid
 *
 * The /account prefix is dropped since this SPA owns its own domain/path.
 */
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <GetSubscriptionPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/login/confirm',
        element: <ConfirmPage />,
      },
      {
        path: '/profile/subscription',
        element: (
          <AuthGuard>
            <ProfileSubscriptionPage />
          </AuthGuard>
        ),
      },
      {
        path: '/subscription/:shortUuid',
        element: <SubscriptionPage />,
      },
      {
        // Catch-all redirect
        path: '*',
        element: <Navigate to='/' replace />,
      },
    ],
  },
]);
