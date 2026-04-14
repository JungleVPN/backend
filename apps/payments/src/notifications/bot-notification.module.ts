import { Module } from '@nestjs/common';
import { BotNotificationService } from './bot-notification.service';

@Module({
  providers: [BotNotificationService],
  exports: [BotNotificationService],
})
export class BotNotificationModule {}
