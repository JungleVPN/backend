import { createApiClient, createPaymentsApi } from '@workspace/core/api';
import { env } from '@/config/env';

export const paymentsApi = createPaymentsApi(
  createApiClient({
    baseUrl: env.paymentsUrl,
  }),
);
