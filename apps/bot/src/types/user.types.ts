/**
 * User-related types used across the bot.
 * These mirror the Remnawave panel's user model.
 */

export type UserDevice = 'ios' | 'android' | 'macOS' | 'windows';
export type UserLocale = 'en' | 'ru';

export interface UserDto {
  uuid: string;
  shortUuid: string;
  username: string;

  status: 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';

  usedTrafficBytes: number;
  lifetimeUsedTrafficBytes: number;

  trafficLimitBytes: number;
  trafficLimitStrategy: 'NO_RESET' | 'DAY' | 'WEEK' | 'MONTH';

  subLastUserAgent: string | null;
  subLastOpenedAt: string;

  expireAt: string;
  onlineAt: string;
  subRevokedAt: string;
  lastTrafficResetAt: string;

  trojanPassword: string;
  vlessUuid: string;
  ssPassword: string;

  description: string | null;
  tag: string | null;
  telegramId: number | null;
  email: string | null;
  hwidDeviceLimit: number | null;

  lastTriggeredThreshold: number;

  createdAt: string;
  updatedAt: string;

  activeInternalSquads: Array<{
    uuid: string;
    name: string;
  }>;

  externalSquadUuid: string | null;

  subscriptionUrl: string;

  lastConnectedNode: {
    connectedAt: string;
    nodeName: string;
    countryCode: string;
  } | null;

  happ: {
    cryptoLink: string;
  };

  userTraffic: {
    usedTrafficBytes: number;
    lifetimeUsedTrafficBytes: number;
    onlineAt: string;
    lastConnectedNodeUuid: string | null;
    firstConnectedAt: string | null;
  };
}

export interface CreateUserRequestDto {
  username: string;
  telegramId?: number | null;
  description?: string;
}

export type CreateUserResponseDto = UserDto;

export interface UpdateUserRequestDto {
  uuid: string;
  username?: string;
  expireAt?: string;
  telegramId?: number | null;
  status?: 'ACTIVE' | 'DISABLED' | 'LIMITED' | 'EXPIRED';
  description?: string;
  trafficLimitBytes?: number;
  trafficLimitStrategy?: 'NO_RESET' | 'DAY' | 'WEEK' | 'MONTH';
  hwidDeviceLimit?: number;
}
