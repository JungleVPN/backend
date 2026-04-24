import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InterServiceGuard } from '@workspace/types';
import { ReferralService } from './referral.service';

@Controller('referrals')
@UseGuards(InterServiceGuard)
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  /** GET /referrals/by-invited/:telegramId */
  @Get('by-invited/:telegramId')
  async getByInvitedId(@Param('telegramId', ParseIntPipe) telegramId: number) {
    return this.referralService.getReferralByInvitedId(telegramId);
  }

  /** POST /referrals — create a referral and handle the full new-user flow */
  @Post()
  async handleNewUser(
    @Body() body: { inviterId: number; invitedTelegramId: number; locale?: string },
  ) {
    return this.referralService.handleNewUser(body.inviterId, body.invitedTelegramId);
  }

  /** POST /referrals/reward-after-payment — reward inviter when invited user pays */
  @Post('reward-after-payment')
  async rewardAfterPayment(@Body() body: { invitedTelegramId: number }) {
    return this.referralService.handleInviterRewardAfterPayment(body.invitedTelegramId);
  }

  /** DELETE /referrals/by-invited/:telegramId */
  @Delete('by-invited/:telegramId')
  async deleteByInvitedId(@Param('telegramId', ParseIntPipe) telegramId: number) {
    await this.referralService.deleteByInvitedId(telegramId);
    return { deleted: true };
  }
}
