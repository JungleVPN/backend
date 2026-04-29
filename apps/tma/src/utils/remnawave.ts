import type { CreateUserResponseDto } from '@workspace/types';
import { remnawaveApi } from '@/api/remnawave';

/**
 * Resolve-or-create a Remnawave user by Telegram ID.
 *
 * Lookup priority (TMA path — telegramId is always present):
 *  1. By telegramId
 *  2. Create new user if not found
 *
 * Mirrors apps/web/src/utils/remnawave.ts but uses the TMA API client
 * (which injects X-Telegram-Init-Data instead of X-Api-Key).
 */
export async function initUser(telegramId: number): Promise<CreateUserResponseDto> {
  try {
    const byTelegram = await remnawaveApi.getUserByTelegramId(String(telegramId));
    if (byTelegram) return byTelegram[0];

    return await remnawaveApi.createUser({ telegramId });
  } catch {
    throw new Error('Failed to initialise Remnawave user for Telegram ID: ' + telegramId);
  }
}
