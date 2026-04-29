import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';

import '@/core/i18n/i18n';
import '@/utils/initDayjs';

import { usePlatformStore } from '@workspace/core/stores';
import { PlatformProvider, TelegramPlatformAdapter } from '@workspace/platform';

import { tmaSDK } from '@/lib/tma-sdk';
import { router } from '@/router';

// ─── 1. Platform store update ─────────────────────────────────────────────────
// Set platform type and init status immediately — before React renders.
// We use getState() directly since we're outside the React tree.
const { setPlatformType, setInitStatus, setClientPlatform, setSdkVersion } =
  usePlatformStore.getState().actions;

setPlatformType('telegram');
setInitStatus('initializing');

// ─── 2. TMA SDK initialisation ───────────────────────────────────────────────
// Signal to Telegram that the app is loading.
// WebApp.ready() dismisses Telegram's native loading splash screen.
// WebApp.expand() requests full-height viewport.
tmaSDK.ready();
tmaSDK.expand();

// Record platform metadata in the store for debugging/analytics.
const clientPlatform = tmaSDK.getPlatform() as
  | 'android'
  | 'ios'
  | 'tdesktop'
  | 'macos'
  | 'web'
  | 'unknown';

setClientPlatform(clientPlatform);
setSdkVersion(tmaSDK.getVersion());
setInitStatus('ready');

// ─── 3. Adapter ───────────────────────────────────────────────────────────────
// TelegramPlatformAdapter is constructed once and shared via PlatformProvider.
// getAuthHeaders() reads tgInitDataRaw from the auth store lazily,
// so the adapter always sends the latest token without needing to be recreated.
const adapter = new TelegramPlatformAdapter();

// ─── 4. Render ────────────────────────────────────────────────────────────────
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PlatformProvider adapter={adapter}>
      <RouterProvider router={router} />
    </PlatformProvider>
  </StrictMode>,
);
