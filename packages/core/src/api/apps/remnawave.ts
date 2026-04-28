import {
  CreateUserCommand,
  CreateUserRequestDto,
  CreateUserResponseDto,
  GetSubpageConfigByShortUuidCommand,
  GetSubscriptionInfoByShortUuidCommand,
  GetSubscriptionPageConfigCommand,
  GetUserByEmailCommand,
  GetUserByTelegramIdCommand,
  UpdateUserCommand,
  UpdateUserResponseDto,
} from '@workspace/types';
import type { ApiClient } from '../client';

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
      body: GetUserByEmailCommand.Request,
    ): Promise<GetUserByEmailCommand.Response['response'] | null> {
      try {
        const data = await client.get<GetUserByEmailCommand.Response['response']>(
          GetUserByEmailCommand.url(body.email),
        );
        if (data.length === 0) return null;
        return data;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
          return null;
        }
        throw err;
      }
    },

    async getUserByTelegramId(
      telegramId: string,
    ): Promise<GetUserByTelegramIdCommand.Response['response'] | null> {
      try {
        const data = await client.get<GetUserByTelegramIdCommand.Response['response']>(
          GetUserByTelegramIdCommand.url(String(telegramId)),
        );
        if (data.length === 0) return null;
        return data;
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'status' in err && err.status === 404) {
          return null;
        }
        throw err;
      }
    },

    async createUser(
      params: Pick<CreateUserRequestDto, 'email' | 'telegramId'>,
    ): Promise<CreateUserResponseDto> {
      return client.post<CreateUserResponseDto>(CreateUserCommand.url, {
        ...params,
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

    async updateUser(body: UpdateUserCommand.Request): Promise<UpdateUserResponseDto> {
      return client.patch<UpdateUserResponseDto>(UpdateUserCommand.url, body);
    },
  };
}

export type RemnawaveApi = ReturnType<typeof createRemnawaveApi>;
