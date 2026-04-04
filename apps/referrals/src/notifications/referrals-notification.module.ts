import { Module } from '@nestjs/common';
import { ReferralsNotificationService } from './referrals-notification.service';

@Module({
  providers: [ReferralsNotificationService],
  exports: [ReferralsNotificationService],
})
export class ReferralsNotificationModule {}
