import { createApiClient, createRemnawaveApi } from '@workspace/core/api';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth';

/**
 * TMA Remnawave API client.
 *
 * Auth header strategy:
 *  Phase 1: X-Telegram-Init-Data header is sent if tgInitDataRaw is set in
 *           the store. Backend will 401 if the header is missing — this is
 *           expected in Phase 1 when initData is not yet validated.
 *  Phase 2: TmaAuthProvider validates initData via the backend before any
 *           API call is made, so tgInitDataRaw is always populated by the
 *           time user-facing API calls fire.
 *
 * The getHeaders callback reads from Zustand's getState() (not a hook) so it
 * can be called outside the React tree (e.g. in useEffect async callbacks).
 */
const tmaClient = createApiClient({
  baseUrl: env.apiUrl,
  getHeaders: (): Record<string, string> => {
    const { tgInitDataRaw } = useAuthStore.getState();
    if (tgInitDataRaw) {
      return { 'X-Telegram-Init-Data': tgInitDataRaw };
    }
    return {};
  },
});

export const remnawaveApi = createRemnawaveApi(tmaClient);
