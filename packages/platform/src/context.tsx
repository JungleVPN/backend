import { createContext, type ReactNode, useContext } from 'react';
import type { PlatformAdapter } from './types';

const PlatformContext = createContext<PlatformAdapter | null>(null);

export interface PlatformProviderProps {
  /** The platform-specific adapter instance. Created once in main.tsx. */
  adapter: PlatformAdapter;
  children: ReactNode;
}

/**
 * PlatformProvider wraps the entire React tree and makes the PlatformAdapter
 * available to all components via the usePlatform() hook.
 *
 * Usage in apps/web/src/main.tsx:
 *   <PlatformProvider adapter={new WebPlatformAdapter(env.authApiKey)}>
 *     <RouterProvider router={router} />
 *   </PlatformProvider>
 *
 * Usage in apps/tma/src/main.tsx (Phase 1):
 *   <PlatformProvider adapter={new TelegramPlatformAdapter()}>
 *     <RouterProvider router={router} />
 *   </PlatformProvider>
 */
export function PlatformProvider({ adapter, children }: PlatformProviderProps) {
  return <PlatformContext.Provider value={adapter}>{children}</PlatformContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the current PlatformAdapter from any component in the tree.
 *
 * Components should use this hook for all platform-divergent behaviour:
 * haptic feedback, back navigation, opening external URLs, and auth headers.
 *
 * Throws if called outside a PlatformProvider — intentional fail-fast.
 */
export function usePlatform(): PlatformAdapter {
  const adapter = useContext(PlatformContext);
  if (!adapter) {
    throw new Error(
      'usePlatform() was called outside a <PlatformProvider>. ' +
        'Ensure PlatformProvider wraps the root of your application in main.tsx.',
    );
  }
  return adapter;
}
