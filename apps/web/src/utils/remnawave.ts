import type { CreateUserRequestDto, CreateUserResponseDto } from '@workspace/types';
import { remnawaveApi } from '@/api/remnawave.ts';

/**
 * Resolve-or-create a remnawave user.
 *
 * Lookup priority:
 *  1. By email  (if provided)
 *  2. By telegramId  (if provided and email lookup missed)
 *  3. Create new user  (if neither lookup returned a result)
 *
 * At least one of `email` or `telegramId` must be present.
 */
export async function initUser(
  body: Pick<CreateUserRequestDto, 'email' | 'telegramId'>,
): Promise<CreateUserResponseDto> {
  if (!body.email && body.telegramId == null) {
    throw new Error('initUser requires at least an email or a telegramId');
  }

  try {
    // 1. Lookup by email
    if (body.email) {
      const byEmail = await remnawaveApi.getUserByEmail({ email: body.email });
      if (byEmail) return byEmail[0];
    }

    // 2. Lookup by telegramId
    if (body.telegramId != null) {
      const byTelegram = await remnawaveApi.getUserByTelegramId(body.telegramId.toString());
      if (byTelegram) return byTelegram[0];
    }

    // 3. Create
    return await remnawaveApi.createUser(body);
  } catch (error) {
    throw new Error('Failed to initialize user');
  }
}
