import * as process from 'node:process';

/**
 * Payment amount utility functions.
 *
 * Migrated from the old @bot/utils/utils module.
 * TODO: Validate these against actual price configuration.
 * The mapping currently uses env vars for EUR prices.
 */

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
 *
 * TODO: This should be driven by a config/pricing table, not hardcoded env var matching.
 */
export function mapEURAmountToMonthsNumber(amount: string): number {
  const priceMonth1 = process.env.PRICE_EUR_MONTH_1;
  const priceMonth3 = process.env.PRICE_EUR_MONTH_3;
  const priceMonth6 = process.env.PRICE_EUR_MONTH_6;

  // Stripe amounts are in cents, convert for comparison
  const amountInEur = (Number(amount) / 100).toString();

  if (amountInEur === priceMonth1) return 1;
  if (amountInEur === priceMonth3) return 3;
  if (amountInEur === priceMonth6) return 6;

  return 1; // default fallback
}
