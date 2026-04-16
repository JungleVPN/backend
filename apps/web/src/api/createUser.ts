import type { CreateUserCommand } from '@remnawave/backend-contract';
import dayjs from 'dayjs';
import { env } from '@/config/env';
import { instance } from './instance';

export async function createUser(email: string) {
  const trialDays = env.trialPeriodInDays;
  const squads = env.internalSquads;
  const expireAt = dayjs(new Date()).add(parseInt(trialDays, 10), 'day').toDate();

  try {
    const response = await instance.post<CreateUserCommand.Response>(
      '/api/users',
      {
        uuid: crypto.randomUUID(),
        email: email,
        expireAt,
        activeInternalSquads: squads,
        trafficLimitStrategy: 'MONTH',
        status: 'ACTIVE',
        username: crypto.randomUUID().slice(0, 8),
      },
    );

    return response.data.response;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}
