import { Module } from '@nestjs/common';
import { InterServiceGuard } from '../common/inter-service.guard';
import { RemnaPanelClient } from '../common/remna-panel.client';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [RemnaPanelClient, UserService, InterServiceGuard],
  exports: [UserService],
})
export class UserModule {}
