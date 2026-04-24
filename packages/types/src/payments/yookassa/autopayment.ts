import type { Payments } from './payment';

export interface CreateAutopaymentDto
  extends Omit<Payments.CreatePaymentRequest, 'metadata' | 'capture'> {
  userId: string;
  telegramId: number | null;
  selectedPeriod: number;
}
