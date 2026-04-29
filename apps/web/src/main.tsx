import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

// Initialize i18n before rendering
import '@/core/i18n/i18n';
// Initialize dayjs plugins
import '@/utils/initDayjs';

import { PlatformProvider, WebPlatformAdapter } from '@workspace/platform';
import { env } from '@/config/env';
import { router } from '@/router.ts';

/**
 * The WebPlatformAdapter is constructed once here and never changes.
 * It receives env.authApiKey so that getAuthHeaders() can inject X-Api-Key
 * without reading import.meta.env directly in components or hooks.
 */
const adapter = new WebPlatformAdapter(env.authApiKey);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider adapter={adapter}>
      <RouterProvider router={router} />
    </PlatformProvider>
  </StrictMode>,
);
