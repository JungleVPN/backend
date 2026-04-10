export interface CreateYookassaPaymentDto {
  readonly userId: string;
  readonly payment: {
    readonly amount: number | string;
    readonly description?: string;
  };
  readonly metadata?: Record<string, any>;
  /** When true, YooKassa saves the payment method for future autopayments */
  readonly savePaymentMethod?: boolean;
}

export interface YookassaPaymentSession {
  id: string;
  url: string;
}

export interface CreateAutopaymentInternalDto {
  readonly userId: string;
  readonly paymentMethodId: string;
  readonly amount: number | string;
  readonly selectedPeriod: number;
  readonly description?: string;
}

export type {
  YookassaNotificationEvent,
  YookassaPaymentPayload,
  YookassaPaymentStatus,
  YookassaWebhookPayload,
} from './yookassa.model';

import type { YookassaPaymentStatus } from './yookassa.model';

export interface AutopaymentApiResponse {
  id: string;
  status: YookassaPaymentStatus;
  paid: boolean;
  amount: { value: string; currency: string };
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    title?: string;
  };
  cancellation_details?: {
    party: string;
    reason: string;
  };
  metadata: Record<string, any>;
}
