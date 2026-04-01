import type Stripe from 'stripe';

export interface CreateStripePaymentDto {
  readonly userId: string;
  readonly payment: {
    readonly amount: number | string;
    readonly currency: 'EUR';
  };
  readonly metadata?: Record<string, any>;
}

export type BillingPortalSession = Promise<Stripe.Response<Stripe.BillingPortal.Session>>;
export type CheckoutSession = Promise<Stripe.Response<Stripe.Checkout.Session>>;
export type Session = BillingPortalSession | CheckoutSession;

export interface StripeInvoicePayload {
  id: string;
  userId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  amount: number | null;
  currency: 'EUR' | null;
  status: Stripe.Invoice.Status | string;
  url: string | null;
  invoiceUrl: string | null;
  paidAt: Date | null;
  metadata: Stripe.Metadata;
}
