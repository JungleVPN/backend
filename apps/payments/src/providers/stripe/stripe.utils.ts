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
 * Maps a EUR amount string (in cents) to the corresponding subscription
 * period in months.  Uses environment variables for price tiers.
 *
 * Finding #12 fix: throws instead of returning a silent default when the
 * amount does not match any configured tier.  Callers must handle the error
 * and must never silently grant an unrecognised amount.
 */
export function mapEURAmountToMonthsNumber(amount: string): number {
  const amountInEur = (Number(amount) / 100).toString();

  const tiers: Array<{ envVar: string; months: number }> = [
    { envVar: 'PRICE_EUR_MONTH_1', months: 1 },
    { envVar: 'PRICE_EUR_MONTH_3', months: 3 },
    { envVar: 'PRICE_EUR_MONTH_6', months: 6 },
  ];

  for (const { envVar, months } of tiers) {
    const price = process.env[envVar];
    if (price && amountInEur === price) {
      return months;
    }
  }

  throw new Error(
    `Unrecognized Stripe amount: ${amount} cents (${amountInEur} EUR). ` +
      `No matching subscription tier found. ` +
      `Configured tiers: PRICE_EUR_MONTH_1=${process.env.PRICE_EUR_MONTH_1}, ` +
      `PRICE_EUR_MONTH_3=${process.env.PRICE_EUR_MONTH_3}, ` +
      `PRICE_EUR_MONTH_6=${process.env.PRICE_EUR_MONTH_6}`,
  );
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
