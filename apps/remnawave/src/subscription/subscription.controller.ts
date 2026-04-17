import { Controller, Get, Param } from '@nestjs/common';
import type {
  GetSubpageConfigByShortUuidCommand,
  GetSubscriptionInfoByShortUuidCommand,
} from '@workspace/types';
import { SubscriptionService } from './subscription.service';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscriptions/subpage-config/:shortUuid')
  async getSubpageConfig(
    @Param('shortUuid') shortUuid: string,
  ): Promise<GetSubpageConfigByShortUuidCommand.Response['response']> {
    return this.subscriptionService.getSubpageConfigByShortUuid(shortUuid);
  }

  @Get('sub/:shortUuid/info')
  async getSubscriptionInfo(
    @Param('shortUuid') shortUuid: string,
  ): Promise<GetSubscriptionInfoByShortUuidCommand.Response['response']> {
    return this.subscriptionService.getSubscriptionInfoByShortUuid(shortUuid);
  }
}
