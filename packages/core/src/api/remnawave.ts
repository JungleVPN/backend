import {
  CreateUserResponseDto,
  GetSubpageConfigByShortUuidCommand,
  GetSubscriptionInfoByShortUuidCommand,
  GetUserByEmailCommand,
  TSubscriptionPageRawConfig,
} from '@workspace/types';
import type { ApiClient } from './client';

/**
 * Remnawave API methods.
 *
 * Accepts an ApiClient so each platform can inject its own auth strategy:
 * - Web: Bearer token from env
 * - TMA: Telegram initData header
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

    async createUser(
      params:
        | {
            email: string;
            telegramId?: string;
          }
        | {
            email?: string;
            telegramId: string;
          },
    ): Promise<CreateUserResponseDto> {
      return await client.post<CreateUserResponseDto>('/api/users', {
        email: params.email,
        telegramId: params.telegramId,
        username: crypto.randomUUID().slice(0, 8),
      });
    },

    async getSubscriptionByShortUuid(shortUuid: string): Promise<
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

    async fetchAppData(appDataUrl: string): Promise<Record<string, TSubscriptionPageRawConfig>> {
      const response = await fetch(`${appDataUrl}?v=${Date.now()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch app config: ${response.status}`);
      }
      return response.json();
    },
  };
}

export type RemnawaveApi = ReturnType<typeof createRemnawaveApi>;
