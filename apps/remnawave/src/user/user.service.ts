import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateUserCommand,
  DeleteUserCommand,
  GetAllUsersCommand,
  GetUserByTelegramIdCommand,
  RevokeUserSubscriptionCommand,
  UpdateUserCommand,
} from '@workspace/types';
import { addDays } from 'date-fns';
import { RemnaPanelClient } from '../common/remna-panel.client';
import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  DeleteUserResponseDto,
  GetUserByTelegramIdResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
  UserDto,
} from './dto';

@Injectable()
export class UserService {
  readonly logger = new Logger(UserService.name);
  constructor(
    private readonly panelClient: RemnaPanelClient,
    private readonly configService: ConfigService,
  ) {}

  async getAllUsers(): Promise<UserDto[]> {
    const size = 1000;
    const allUsers: UserDto[] = [];
    let start = 0;

    for (;;) {
      const { total, users } = await this.panelClient.request<{
        total: number;
        users: UserDto[];
      }>({
        url: `${GetAllUsersCommand.url}?page=${start}&size=${size}`,
        method: GetAllUsersCommand.endpointDetails.REQUEST_METHOD,
      });

      allUsers.push(...users);

      if (users.length === 0) break;
      if (allUsers.length >= total) break;
      if (users.length < size) break;

      start += size;
    }

    return allUsers;
  }

  async getUserByTgId(
    telegramId: CreateUserRequestDto['telegramId'],
  ): Promise<GetUserByTelegramIdResponseDto | null> {
    if (!telegramId) return null;
    try {
      // Panel returns an array of users for this endpoint
      const users = await this.panelClient.request<GetUserByTelegramIdResponseDto>({
        method: GetUserByTelegramIdCommand.endpointDetails.REQUEST_METHOD,
        url: GetUserByTelegramIdCommand.url(telegramId.toString()),
      });

      if (!users || users.length === 0) return null;
      return users;
    } catch (e: any) {
      if (e.status === 404) return null;
      throw e;
    }
  }

  async createUser(
    payload: Pick<CreateUserRequestDto, 'username' | 'telegramId' | 'description'>,
  ): Promise<CreateUserResponseDto> {
    const trialDays = Number(this.configService.get('TRIAL_PERIOD_IN_DAYS', '3'));
    const squads = JSON.parse(this.configService.get('REMNAWAVE_INTERNAL_SQUADS', '[]'));
    const expiryTime = addDays(new Date(), trialDays);

    const body: CreateUserRequestDto = {
      username: payload.username,
      telegramId: payload.telegramId,
      expireAt: expiryTime,
      activeInternalSquads: squads,
      trafficLimitStrategy: 'MONTH',
      status: 'ACTIVE',
      description: payload.description,
    };

    return this.panelClient.request<CreateUserResponseDto>({
      url: CreateUserCommand.url,
      method: CreateUserCommand.endpointDetails.REQUEST_METHOD,
      body,
    });
  }

  async updateUser(body: UpdateUserRequestDto): Promise<UpdateUserResponseDto> {
    return this.panelClient.request<UpdateUserResponseDto>({
      url: UpdateUserCommand.url,
      method: UpdateUserCommand.endpointDetails.REQUEST_METHOD,
      body,
    });
  }

  async deleteUser(uuid: string): Promise<DeleteUserResponseDto> {
    return await this.panelClient.request<DeleteUserResponseDto>({
      url: DeleteUserCommand.url(uuid),
      method: DeleteUserCommand.endpointDetails.REQUEST_METHOD,
    });
  }

  async revokeSubscription(uuid: string): Promise<string> {
    const data = await this.panelClient.request<UserDto>({
      url: RevokeUserSubscriptionCommand.url(uuid),
      method: RevokeUserSubscriptionCommand.endpointDetails.REQUEST_METHOD,
    });

    return data.subscriptionUrl;
  }
}
