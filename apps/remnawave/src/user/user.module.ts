import { Module } from '@nestjs/common';
import { RemnaPanelClient } from '../common/remna-panel.client';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [RemnaPanelClient, UserService],
  exports: [UserService],
})
export class UserModule {}
