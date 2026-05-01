import { createApiClient } from '@workspace/core/api';
import { env } from '@/config/env';

export const backendClient = createApiClient({
  baseUrl: env.remnawaveUrl,
});
