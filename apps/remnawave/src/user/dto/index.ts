import {
  CreateUserCommand,
  DeleteUserCommand,
  GetUserByTelegramIdCommand,
  GetUserByUuidCommand,
  UpdateUserCommand,
} from '@remnawave/backend-contract';

export type CreateUserRequestDto = CreateUserCommand.Request;
export type UpdateUserRequestDto = UpdateUserCommand.Request;

export type UserDto = CreateUserCommand.Response['response'];

// by-telegram-id returns an array of users inside `response`
export type GetUserByTelegramIdResponseDto = GetUserByTelegramIdCommand.Response['response'];
export type GetUserByUuidResponseDto = GetUserByUuidCommand.Response['response'];
export type CreateUserResponseDto = CreateUserCommand.Response['response'];
export type UpdateUserResponseDto = UpdateUserCommand.Response['response'];
export type DeleteUserResponseDto = DeleteUserCommand.Response['response'];
