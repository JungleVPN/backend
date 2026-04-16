import type { GetUserByEmailCommand } from '@remnawave/backend-contract';
import { instance } from './instance';

export const getUser = async (
  email: string,
): Promise<GetUserByEmailCommand.Response['response'] | null> => {
  try {
    const response = await instance.get<GetUserByEmailCommand.Response>(
      `/api/users/email/${encodeURIComponent(email)}`,
    );

    if (response.data.response.length === 0) {
      return null;
    }

    return response.data.response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Failed to fetch user by email:', error);
    throw error;
  }
};
