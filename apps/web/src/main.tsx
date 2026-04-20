import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

// Initialize i18n before rendering
import '@/core/i18n/i18n';
// Initialize dayjs plugins
import '@/utils/initDayjs';

import { router } from '@/router.ts';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
