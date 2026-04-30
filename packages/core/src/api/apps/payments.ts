import { type CreateYookassaSessionDto, PaymentSession, SavedMethodDto } from '@workspace/types';
import type { ApiClient } from '../client';

export function createPaymentsApi(client: ApiClient) {
  return {
    async createYookassaSession(dto: CreateYookassaSessionDto): Promise<PaymentSession> {
      return client.post<PaymentSession>('/payments/yookassa/create-session', dto);
    },

    async getSavedMethods(userId: string): Promise<SavedMethodDto[]> {
      return client.get<SavedMethodDto[]>(
        `/payments/yookassa/saved-methods/${encodeURIComponent(userId)}`,
      );
    },

    async deleteSavedMethod(userId: string, id: string): Promise<void> {
      return client.delete<void>(
        `/payments/yookassa/saved-methods/${encodeURIComponent(userId)}/${encodeURIComponent(id)}`,
      );
    },
  };
}
