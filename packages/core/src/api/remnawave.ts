import {
  CreateUserCommand,
  CreateUserResponseDto,
  GetSubpageConfigByShortUuidCommand,
  GetSubscriptionInfoByShortUuidCommand,
  GetSubscriptionPageConfigCommand,
  GetUserByEmailCommand,
} from '@workspace/types';
import type { ApiClient } from './client';

/**
 * Shared Remnawave API.
 *
 * All paths come directly from `@remnawave/backend-contract` commands,
 * so they match both the Remnawave panel AND the NestJS proxy (which
 * mirrors the same URL structure).
 *
 * Accepts an ApiClient so each platform can inject its own auth strategy:
 * - Web: API key header → NestJS proxy
 * - TMA: Telegram initData header → NestJS proxy
 */
export function createRemnawaveApi(client: ApiClient) {
  return {
    async getUserByEmail(
      email: string,
    ): Promise<GetUserByEmailCommand.Response['response'] | null> {
      try {
        const data = await client.get<GetUserByEmailCommand.Response>(
          GetUserByEmailCommand.url(email),
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
      params: { email: string; telegramId?: string } | { email?: string; telegramId: string },
    ): Promise<CreateUserResponseDto> {
      return client.post<CreateUserResponseDto>(CreateUserCommand.url, {
        email: params.email,
        telegramId: params.telegramId,
        username: crypto.randomUUID().slice(0, 8),
      });
    },

    async getSubpageConfigByShortUuid(
      shortUuid: string,
    ): Promise<GetSubpageConfigByShortUuidCommand.Response['response']> {
      return await client.get<GetSubpageConfigByShortUuidCommand.Response['response']>(
        GetSubpageConfigByShortUuidCommand.url(shortUuid),
      );
    },

    async getSubscriptionInfoByShortUuid(
      shortUuid: string,
    ): Promise<GetSubscriptionInfoByShortUuidCommand.Response['response']> {
      return await client.get<GetSubscriptionInfoByShortUuidCommand.Response['response']>(
        GetSubscriptionInfoByShortUuidCommand.url(shortUuid),
      );
    },

    async getSubscriptionPageConfig(
      uuid: string,
    ): Promise<GetSubscriptionPageConfigCommand.Response['response']> {
      return await client.get<GetSubscriptionPageConfigCommand.Response['response']>(
        GetSubscriptionPageConfigCommand.url(uuid),
      );
    },
  };
}

export type RemnawaveApi = ReturnType<typeof createRemnawaveApi>;
