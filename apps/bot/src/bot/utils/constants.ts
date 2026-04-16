import * as process from 'node:process';
import { PaymentPeriod } from '@shared/payments';

export const paymentPeriods: PaymentPeriod[] = JSON.parse(
  process.env.PAYMENT_PERIODS || '["month_1", "month_3", "month_6"]',
);

export const PROD = 'production';
export const STAGE = 'stage';
export const DEV = 'development';
