import * as process from 'node:process';
import Stripe from 'stripe';

/**
 * Converts a Stripe amount (in cents) to the display amount.
 * Stripe amounts are always in the smallest currency unit (e.g., cents for EUR).
 */
export function mapToCorrectAmount(amountInCents: number): number {
  return amountInCents / 100;
}

/**
 * Maps a EUR amount string to the corresponding subscription period in months.
 * Uses environment variables for price tiers.
 */
export function mapEURAmountToMonthsNumber(amount: string): number {
  const priceMonth1 = process.env.PRICE_EUR_MONTH_1;
  const priceMonth3 = process.env.PRICE_EUR_MONTH_3;
  const priceMonth6 = process.env.PRICE_EUR_MONTH_6;

  const amountInEur = (Number(amount) / 100).toString();

  if (amountInEur === priceMonth1) return 1;
  if (amountInEur === priceMonth3) return 3;
  if (amountInEur === priceMonth6) return 6;

  return 1;
}

export const customerToId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null,
) => {
  if (!customer) return null;

  if (typeof customer === 'string') {
    return customer;
  } else if (customer.deleted) {
    return null;
  } else {
    return customer.id;
  }
};

export const subscriptionToId = (subscription: string | Stripe.Subscription | undefined) => {
  if (!subscription) return null;

  if (typeof subscription === 'string') {
    return subscription;
  } else {
    return subscription.id;
  }
};
