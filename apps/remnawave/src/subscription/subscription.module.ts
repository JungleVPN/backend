import { Module } from '@nestjs/common';
import { RemnaPanelClient } from '../common/remna-panel.client';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPageConfigController } from './subscription-page-config.controller';

@Module({
  controllers: [SubscriptionController, SubscriptionPageConfigController],
  providers: [RemnaPanelClient, SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
