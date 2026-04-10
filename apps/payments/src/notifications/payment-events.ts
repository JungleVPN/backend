/**
 * Payment event constants and payload types.
 *
 * Used by webhook services (emitters) and notification services (listeners).
 * Keep payloads provider-agnostic where possible — provider-specific fields are optional.
 */

export const PAYMENT_EVENTS = {
  SUCCEEDED: 'payment.succeeded',
  FAILED: 'payment.failed',
  METHOD_SAVED: 'payment.method_saved',
  AUTOPAYMENT_FAILED: 'payment.autopayment_failed',
} as const;

export interface PaymentSucceededEvent {
  telegramId: number;
  provider: 'stripe' | 'yookassa';
  selectedPeriod: number;
  expireAt?: string;
  /** Stripe-specific: hosted invoice URL */
  invoiceUrl?: string;
}

export interface PaymentMethodSavedEvent {
  telegramId: number;
  provider: 'yookassa';
  paymentMethodType: string;
  title?: string | null;
}

export interface AutopaymentFailedEvent {
  telegramId: number;
  provider: 'yookassa';
  selectedPeriod: number;
  /** YooKassa cancellation reason, e.g. 'insufficient_funds', 'permission_revoked' */
  reason: string;
  party: string;
}
