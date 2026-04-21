import { CreateUserRequestDto } from '@workspace/types';
import { remnawaveApi } from '@/api/remnawave.ts';

export const initUser = async (body: Pick<CreateUserRequestDto, 'email' | 'telegramId'>) => {
  try {
    const user = await remnawaveApi.getUserByEmail({ email: body.email || '' });
    if (!user) {
      return await remnawaveApi.createUser({ ...body });
    }
    return user[0];
  } catch (error) {
    throw new Error('Failed to initialize user');
  }
};
