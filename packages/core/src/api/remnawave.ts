import type {
  CreateUserCommand,
  GetSubpageConfigByShortUuidCommand,
  GetSubscriptionInfoByShortUuidCommand,
  GetUserByEmailCommand,
} from '@remnawave/backend-contract';
import type { TSubscriptionPageRawConfig } from '@remnawave/subscription-page-types';
import type { ApiClient } from './client';

/**
 * Remnawave API methods.
 *
 * Accepts an ApiClient so each platform can inject its own auth strategy:
 * - Web: Bearer token from env
 * - TMA: Telegram initData header
 *
 * Usage:
 *   const api = createRemnawaveApi(client);
 *   const user = await api.getUserByEmail('user@example.com');
 */
export function createRemnawaveApi(client: ApiClient) {
  return {
    async getUserByEmail(
      email: string,
    ): Promise<GetUserByEmailCommand.Response['response'] | null> {
      try {
        const data = await client.get<GetUserByEmailCommand.Response>(
          `/api/users/email/${encodeURIComponent(email)}`,
        );
        if (data.response.length === 0) return null;
        return data.response;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
          return null;
        }
        throw err;
      }
    },

    async createUser(params: {
      email: string;
      expireAt: Date;
      squads: string[];
    }): Promise<CreateUserCommand.Response['response']> {
      const data = await client.post<CreateUserCommand.Response>('/api/users', {
        uuid: crypto.randomUUID(),
        email: params.email,
        expireAt: params.expireAt,
        activeInternalSquads: params.squads,
        trafficLimitStrategy: 'MONTH',
        status: 'ACTIVE',
        username: crypto.randomUUID().slice(0, 8),
      });
      return data.response;
    },

    async getSubscriptionByShortUuid(
      shortUuid: string,
    ): Promise<
      GetSubscriptionInfoByShortUuidCommand.Response['response'] & {
        subpageConfigUuid?: string;
      }
    > {
      const subpageConfig = await client.get<GetSubpageConfigByShortUuidCommand.Response>(
        `/api/subscription/subpage-config/${shortUuid}`,
      );

      const subscriptionInfo = await client.get<GetSubscriptionInfoByShortUuidCommand.Response>(
        `/api/subscription/info/${shortUuid}`,
      );

      return {
        ...subscriptionInfo.response,
        subpageConfigUuid: subpageConfig.response.subpageConfigUuid ?? undefined,
      };
    },

    async fetchAppData(
      appDataUrl: string,
    ): Promise<Record<string, TSubscriptionPageRawConfig>> {
      const response = await fetch(`${appDataUrl}?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch app config: ${response.status}`);
      }
      return response.json();
    },
  };
}

export type RemnawaveApi = ReturnType<typeof createRemnawaveApi>;
