import type { UpdateUserCommand } from '@workspace/types';
import { useCallback } from 'react';
import type { createRemnawaveApi } from '../api';
import { useAsync } from './use-async';

type RemnawaveApi = ReturnType<typeof createRemnawaveApi>;

/**
 * Updates a remnawave user (e.g. to save an email for Telegram-authenticated users).
 *
 * Usage:
 *   const { isLoading, execute } = useUpdateUser(remnawaveApi);
 *   await execute({ uuid, email });
 */
export function useUpdateUser(api: RemnawaveApi) {
  const fn = useCallback((body: UpdateUserCommand.Request) => api.updateUser(body), [api]);
  return useAsync(fn);
}
