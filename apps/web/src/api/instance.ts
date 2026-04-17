import { createApiClient, createRemnawaveApi } from '@workspace/core/api';
import { env } from '@/config/env';

/**
 * Web-specific API client.
 * Authenticates with the Remnawave panel via Bearer token from env.
 */
export const apiClient = createApiClient({
  baseUrl: env.remnawavePanelUrl,
  getHeaders: () => {
    const headers: Record<string, string> = {
      'user-agent': 'Remnawave Mini App Subscription Page',
      Authorization: `Bearer ${env.remnawaveToken}`,
    };

    if (env.remnawavePanelUrl?.startsWith('http://')) {
      headers['x-forwarded-for'] = '127.0.0.1';
      headers['x-forwarded-proto'] = 'https';
    }

    if (env.authApiKey) {
      headers['X-Api-Key'] = env.authApiKey;
    }

    return headers;
  },
});

/**
 * Typed Remnawave API — same endpoints the TMA app uses,
 * just with web-specific auth headers.
 */
export const remnawaveApi = createRemnawaveApi(apiClient);

/**
 * Web-specific: creates a trial user with trial period and squads from env.
 * TMA will have its own version of this with Telegram-specific defaults.
 */
export async function createTrialUser(email: string) {
  return remnawaveApi.createUser({
    email,
  });
}
