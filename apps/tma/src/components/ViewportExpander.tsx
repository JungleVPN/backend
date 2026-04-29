import { useEffect } from 'react';
import { tmaSDK } from '@/lib/tma-sdk';

/**
 * ViewportExpander — Requests full-height expansion of the TMA viewport.
 *
 * Mounts once inside RootLayout and calls WebApp.expand(). This is idempotent
 * — Telegram ignores the call if the viewport is already expanded.
 *
 * Renders nothing (transparent passthrough). Must be placed inside the React
 * tree so useEffect fires after React hydrates, but it does not wrap children
 * — keep it as a sibling of the content rather than a wrapper.
 */
export function ViewportExpander() {
  useEffect(() => {
    tmaSDK.expand();
  }, []);

  return null;
}
