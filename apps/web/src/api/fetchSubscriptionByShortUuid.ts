import type {
  GetSubpageConfigByShortUuidCommand,
  GetSubscriptionInfoByShortUuidCommand,
} from '@remnawave/backend-contract';
import { AxiosError } from 'axios';
import { instance } from './instance';

export async function fetchSubscriptionByShortUuid(
  shortUuid: string,
): Promise<
  GetSubscriptionInfoByShortUuidCommand.Response['response'] & { subpageConfigUuid?: string }
> {
  try {
    // Fetch subpage config to get the config UUID
    const subpageConfig = await instance.get<GetSubpageConfigByShortUuidCommand.Response>(
      `/api/subscription/subpage-config/${shortUuid}`,
    );

    if (subpageConfig.status !== 200) {
      throw new Error('Failed to get subscription UUID');
    }

    // Fetch subscription info
    const subscriptionInfo = await instance.get<GetSubscriptionInfoByShortUuidCommand.Response>(
      `/api/subscription/info/${shortUuid}`,
    );

    if (subscriptionInfo.status !== 200) {
      throw new Error('Failed to get subscription info');
    }

    const response = subscriptionInfo.data.response;

    return {
      ...response,
      subpageConfigUuid: subpageConfig.data.response.subpageConfigUuid ?? undefined,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new AxiosError('Users not found', 'ERR_GET_SUB_LINK');
      }
      if (error.response?.data?.message === 'Error get sub link') {
        throw new AxiosError('Error get sub link', 'ERR_GET_SUB_LINK');
      }
    }
    console.error('Failed to fetch subscription by shortUuid:', error);
    throw error;
  }
}
