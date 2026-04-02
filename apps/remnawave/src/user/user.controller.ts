import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import * as Remnawave from './dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<Remnawave.UserDto[]> {
    return this.userService.getAllUsers();
  }

  @Get('by-telegramId/:telegramId')
  async getUserByTelegramId(
    @Param('telegramId') telegramId: Remnawave.CreateUserRequestDto['telegramId'],
  ): Promise<Remnawave.GetUserByTelegramIdResponseDto | null> {
    return this.userService.getUserByTgId(telegramId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() body: Pick<Remnawave.CreateUserRequestDto, 'username' | 'telegramId' | 'description'>,
  ): Promise<Remnawave.CreateUserResponseDto> {
    return this.userService.createUser(body);
  }

  @Patch()
  async updateUser(
    @Body() body: Remnawave.UpdateUserRequestDto,
  ): Promise<Remnawave.UpdateUserResponseDto> {
    console.log(`Updating user ${body.uuid} with data:`, body);
    return this.userService.updateUser(body);
  }

  @Delete(':uuid')
  async deleteUser(@Param('uuid') uuid: string): Promise<Remnawave.DeleteUserResponseDto> {
    return await this.userService.deleteUser(uuid);
  }

  @Post('revoke-subscription/:uuid')
  async revokeSubscription(@Param('uuid') uuid: string): Promise<string> {
    return await this.userService.revokeSubscription(uuid);
  }
}
