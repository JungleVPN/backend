/**
 * Payment event constants and payload types.
 *
 * Used by webhook services (emitters) and notification services (listeners).
 * Keep payloads provider-agnostic where possible — provider-specific fields are optional.
 */

export const PAYMENT_EVENTS = {
  SUCCEEDED: 'payment.succeeded',
  FAILED: 'payment.failed',
} as const;

export interface PaymentSucceededEvent {
  telegramId: number;
  provider: 'stripe' | 'yookassa';
  selectedPeriod: number;
  expireAt?: string;
  /** Stripe-specific: hosted invoice URL */
  invoiceUrl?: string;
}
