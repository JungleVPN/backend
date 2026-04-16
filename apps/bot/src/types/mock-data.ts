import { UserDto } from './user.types';

/**
 * Mock data used for development/staging broadcast testing.
 */

export const mockUserDto: UserDto = {
  uuid: '123e4567-e89b-12d3-a456-426614174000',
  shortUuid: 'abc123',
  username: '575800239',

  status: 'ACTIVE',

  usedTrafficBytes: 0,
  lifetimeUsedTrafficBytes: 0,

  trafficLimitBytes: 1073741824,
  trafficLimitStrategy: 'MONTH',

  subLastUserAgent: null,
  subLastOpenedAt: new Date().toISOString(),

  expireAt: new Date().toISOString(),
  onlineAt: new Date().toISOString(),
  subRevokedAt: new Date().toISOString(),
  lastTrafficResetAt: new Date().toISOString(),

  trojanPassword: 'trojanpass',
  vlessUuid: '123e4567-e89b-12d3-a456-426614174001',
  ssPassword: 'sspass',

  description: null,
  tag: null,
  telegramId: 575800239,
  email: null,
  hwidDeviceLimit: null,

  lastTriggeredThreshold: 0,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),

  activeInternalSquads: [],

  externalSquadUuid: null,

  subscriptionUrl: 'https://example.com/subscription',

  lastConnectedNode: null,

  happ: {
    cryptoLink: 'https://example.com/crypto',
  },

  userTraffic: {
    usedTrafficBytes: 860903544,
    lifetimeUsedTrafficBytes: 860903544,
    onlineAt: '2026-02-09T21:57:30.119Z',
    lastConnectedNodeUuid: 'd3659e85-01ec-4865-90c4-86fd8d23686f',
    firstConnectedAt: '2026-02-09T18:48:30.150Z',
  },
};

export const mockBroadcastUserDto: UserDto[] = [
  {
    ...mockUserDto,
    uuid: '504dbd6c-09e6-4fea-9a73-92974ef6185f',
    username: '7683608743',
    telegramId: 7683608743,
    userTraffic: {
      ...mockUserDto.userTraffic,
      firstConnectedAt: null,
    },
  },
  {
    ...mockUserDto,
    uuid: 'cab71e6c-5577-4ebb-8756-719a5edaf5d6',
    username: '5986698166',
    telegramId: 5986698166,
    email: '7683608743',
    userTraffic: {
      ...mockUserDto.userTraffic,
      firstConnectedAt: '2026-02-09T21:57:30.119Z',
    },
  },
];
