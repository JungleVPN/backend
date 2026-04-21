import { type CreateYookassaSessionDto, PaymentSession, SavedMethodDto } from '@workspace/types';
import type { ApiClient } from '../client';

export function createPaymentsApi(client: ApiClient) {
  return {
    async createYookassaSession(dto: CreateYookassaSessionDto): Promise<PaymentSession> {
      return client.post<PaymentSession>('/api/payments/yookassa/create-session', dto);
    },

    async getSavedMethods(userId: string): Promise<SavedMethodDto[]> {
      return client.get<SavedMethodDto[]>(
        `/api/payments/yookassa/saved-methods/${encodeURIComponent(userId)}`,
      );
    },
  };
}
