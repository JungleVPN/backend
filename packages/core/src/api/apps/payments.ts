import { PaymentSession, type Payments } from '@workspace/types';
import type { ApiClient } from '../client';

export function createPaymentsApi(client: ApiClient) {
  return {
    async createYookassaSession(dto: Payments.CreatePaymentRequest): Promise<PaymentSession> {
      return client.post<PaymentSession>('/api/payments/yookassa/create-session', dto);
    },
  };
}
