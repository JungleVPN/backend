import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';

@Module({
  exports: [ReferralService],
  providers: [ReferralService],
})
export class ReferralModule {}
