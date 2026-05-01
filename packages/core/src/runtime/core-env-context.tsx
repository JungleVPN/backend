import { createContext, type ReactNode, useContext } from 'react';

export interface CoreRuntimeEnv {
  subpageConfigUuid: string;
  allowedAmounts?: string;
  allowedPeriods?: number;
  supportUrl?: string;
  /** e.g. web `/profile/subscription`, TMA `/` */
  subscriptionPortalPath: string;
  /** Path segment for payment redirect `return_url` (leading slash). */
  paymentReturnPath: string;
  /** AuthGuard redirect when there is no web/Telegram session (web: `/login`, TMA: `/`). */
  authGateRedirectPath: string;
  /** Bottom tab: subscription (web `/profile/subscription`, TMA `/`). */
  profileSubscriptionPath: string;
  /** Bottom tab: payment (web `/profile/payment`, TMA `/payment`). */
  profilePaymentPath: string;
}

const CoreEnvContext = createContext<CoreRuntimeEnv | null>(null);

export function CoreEnvProvider({
  value,
  children,
}: {
  value: CoreRuntimeEnv;
  children: ReactNode;
}) {
  return <CoreEnvContext.Provider value={value}>{children}</CoreEnvContext.Provider>;
}

export function useCoreEnv(): CoreRuntimeEnv {
  const ctx = useContext(CoreEnvContext);
  if (!ctx) {
    throw new Error('CoreEnvProvider is required for pages that call useCoreEnv()');
  }
  return ctx;
}
