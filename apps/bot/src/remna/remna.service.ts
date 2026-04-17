import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { RemnaError } from '@remna/remna.error';
import { CreateUserResponseDto, UpdateUserRequestDto, UserDto } from '@shared/user.types';
import { createBackendClient } from '@utils/http-client';
import { AxiosInstance } from 'axios';

@Injectable()
export class RemnaService {
  private readonly logger = new Logger(RemnaService.name);

  private backend: AxiosInstance = createBackendClient(
    process.env.REMNAWAVE_URL || 'http://localhost:3002',
  );

  private async fetch<Data>({
    method = 'POST',
    url,
    body,
  }: {
    url: string;
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: unknown;
  }): Promise<Data> {
    try {
      const res = await this.backend.request({
        method,
        url,
        data: body,
      });

      if (res.status === 404) {
        return null as Data;
      }

      if (res.status >= 400) {
        throw new RemnaError(`Remnawave service error: ${method} ${url}`, res.status, res.data);
      }

      return res.data;
    } catch (e: any) {
      if (e instanceof RemnaError) throw e;

      const status = e.response?.status;
      const payload = e.response?.data;

      console.error('REMNAWAVE REQUEST ERROR', {
        url,
        method,
        status,
        payload,
        message: e.message,
      });

      throw new RemnaError(`Remnawave request failed: ${url}`, status, payload);
    }
  }

  async init(telegramId: number, language_code: string): Promise<UserDto> {
    const user = await this.getUserByTgId(telegramId);
    if (!user) {
      return await this.createUser({
        telegramId,
        description: language_code,
        username: telegramId.toString(),
      });
    } else {
      if (user.description !== language_code) {
        await this.updateUser({
          uuid: user.uuid,
          description: language_code,
        });
      }

      return user;
    }
  }

  async getAllUsers(): Promise<UserDto[]> {
    return this.fetch<UserDto[]>({
      url: '/api/users',
      method: 'GET',
    });
  }

  async createUser(payload: { username: string; telegramId: number; description?: string }) {
    return this.fetch<CreateUserResponseDto>({
      url: '/api/users',
      body: payload,
    });
  }

  async updateUser(body: UpdateUserRequestDto) {
    return this.fetch<UserDto>({
      method: 'PATCH',
      url: '/api/users',
      body,
    });
  }

  async getUserByTgId(id: number): Promise<UserDto | null> {
    const users = await this.fetch<CreateUserResponseDto[] | null>({
      url: `/api/users/by-telegram-id/${id}`,
      method: 'GET',
    });

    if (!users || users.length === 0) return null;
    return users[0];
  }

  async deleteUser(uuid: string) {
    await this.fetch({ url: `/api/users/${uuid}`, method: 'DELETE' });
  }

  async revokeSub(uuid: string) {
    const subscriptionUrl = await this.fetch<string>({
      url: `/api/users/${uuid}/actions/revoke`,
    });

    return subscriptionUrl;
  }

  /**
   * Checks if a user should be removed due to being blocked/invalid.
   * Used during broadcast/poll distribution to clean up dead users.
   */
  async handleInvalidUserRemoval(user: UserDto, errorMessage: string): Promise<boolean> {
    const blockedPatterns = [
      'bot was blocked by the user',
      'user is deactivated',
      'chat not found',
    ];

    if (user.email) return false;

    const isInvalid = blockedPatterns.some((pattern) =>
      errorMessage.toLowerCase().includes(pattern),
    );

    if (isInvalid && user.uuid) {
      try {
        await this.deleteUser(user.uuid);
        this.logger.log(`Removed invalid user ${user.telegramId} (${errorMessage})`);
        return true;
      } catch (e) {
        this.logger.error(`Failed to remove invalid user ${user.telegramId}: ${e}`);
      }
    }

    return false;
  }
}
