import { Controller, Get, Param } from '@nestjs/common';
import type { GetSubscriptionPageConfigCommand } from '@workspace/types';
import { SubscriptionService } from './subscription.service';

@Controller('subscription-page-configs')
export class SubscriptionPageConfigController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get(':uuid')
  async getSubscriptionPageConfig(
    @Param('uuid') uuid: string,
  ): Promise<GetSubscriptionPageConfigCommand.Response['response']> {
    return this.subscriptionService.getSubscriptionPageConfig(uuid);
  }
}
