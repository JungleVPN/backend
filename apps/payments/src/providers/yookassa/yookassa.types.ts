export interface CreateYookassaPaymentDto {
  readonly userId: string;
  readonly payment: {
    readonly amount: number | string;
    readonly description?: string;
  };
  readonly metadata?: Record<string, any>;
}

export interface YookassaPaymentSession {
  id: string;
  url: string;
}

export type {
  YookassaNotificationEvent,
  YookassaPaymentPayload,
  YookassaPaymentStatus,
  YookassaWebhookPayload,
} from './yookassa.model';
