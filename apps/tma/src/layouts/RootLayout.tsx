import { Outlet } from 'react-router';
import { TmaAuthProvider } from '@/components/TmaAuthProvider';
import { ViewportExpander } from '@/components/ViewportExpander';

import '@/assets/globals.css';

/**
 * TMA RootLayout — the top-level shell for the Telegram Mini App.
 *
 * Deliberately minimal compared to the web RootLayout:
 *  ✗ No <Header> — Telegram provides its own navigation chrome.
 *  ✗ No <AuthButtons> — Telegram identity is implicit.
 *  ✓ TmaAuthProvider — resolves Telegram user from initData.
 *  ✓ ViewportExpander — maximises the TMA viewport on mount.
 *  ✓ Outlet — renders the matched route's component.
 *
 * Safe-area insets (for iOS notch / Telegram nav bar overlap) are handled
 * via CSS env(safe-area-inset-*) in globals.css.
 */
export function RootLayout() {
  return (
    <TmaAuthProvider>
      <ViewportExpander />
      <div className='tma-root'>
        <Outlet />
      </div>
    </TmaAuthProvider>
  );
}
