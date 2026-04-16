import { Module } from '@nestjs/common';
import { NotificationController } from './webhook.controller';

@Module({
  controllers: [NotificationController],
})
export class WebhookModule {}
