/**
 * Domain DTOs for our autopayment flow.
 * These are NOT part of the YooKassa API — they're our internal contracts
 * between webhook → payments service → bot.
 */
export interface MakeAutopaymentDto {
  userId: string;
  telegramId: number | null;
  amount: number;
  selectedPeriod: number;
  description?: string;
}
