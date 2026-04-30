import {
  apiRoutes,
  type CreateYookassaSessionDto,
  PaymentSession,
  SavedMethodDto,
} from '@workspace/types';
import type { ApiClient } from '../client';

export function createPaymentsApi(client: ApiClient) {
  return {
    async createYookassaSession(dto: CreateYookassaSessionDto): Promise<PaymentSession> {
      return client.post<PaymentSession>(apiRoutes.payments.yookassaCreateSession, dto);
    },

    async getSavedMethods(userId: string): Promise<SavedMethodDto[]> {
      return client.get<SavedMethodDto[]>(apiRoutes.payments.yookassaSavedMethods(userId));
    },

    async deleteSavedMethod(userId: string, id: string): Promise<void> {
      return client.delete<void>(apiRoutes.payments.yookassaSavedMethodById(userId, id));
    },
  };
}
