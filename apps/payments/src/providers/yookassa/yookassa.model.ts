export interface YookassaPaymentPayload {
  id: string;
  status: YookassaPaymentStatus;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  authorization_details?: {
    rrn?: string;
    auth_code?: string;
    three_d_secure?: {
      applied: boolean;
    };
  };
  created_at: string; // ISO timestamp
  description?: string;
  expires_at?: string; // ISO timestamp
  metadata: Record<string, any>;
  payment_method?: {
    type: string;
    id: string;
    saved: boolean;
    card?: {
      first6?: string;
      last4?: string;
      expiry_month?: string;
      expiry_year?: string;
      card_type?: string;
      issuer_country?: string;
      issuer_name?: string;
    };
    title?: string;
  };
  refundable: boolean;
  test: boolean;
}

export type YookassaPaymentStatus = 'pending' | 'succeeded';

export type YookassaNotificationEvent =
  | 'payment.succeeded'
  | 'payment.canceled'
  | 'payment.waiting_for_capture';

export interface YookassaWebhookPayload {
  type: 'notification';
  event: YookassaNotificationEvent;
  object: YookassaPaymentPayload;
}
