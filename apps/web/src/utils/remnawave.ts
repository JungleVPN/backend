import { CreateUserRequestDto } from '@workspace/types';
import { remnawaveApi } from '@/api/remnawave.ts';

export const initUser = async (body: Pick<CreateUserRequestDto, 'email' | 'telegramId'>) => {
  const existingUser = await remnawaveApi.getUserByEmail({ email: body.email || '' });

  if (existingUser && existingUser.length > 0) {
    return existingUser[0];
  } else {
    return await remnawaveApi.createUser({ email: body.email, telegramId: body.telegramId });
  }
};
