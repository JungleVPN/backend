import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { decodeReferralCode } from './referral.utils';

@Controller('referrals')
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
    return this.referralService.handleNewUser(body.inviterId, body.invitedTelegramId, body.locale);
  }

  /** POST /referrals/reward-after-payment — reward inviter when invited user pays */
  @Post('reward-after-payment')
  async rewardAfterPayment(@Body() body: { invitedTelegramId: number }) {
    return this.referralService.handleInviterRewardAfterPayment(body.invitedTelegramId);
  }

  /** GET /referrals/link/:telegramId — get referral link for a user */
  @Get('link/:telegramId')
  getReferralLink(@Param('telegramId', ParseIntPipe) telegramId: number) {
    return { link: this.referralService.getReferralLink(telegramId) };
  }

  /** GET /referrals/decode?code=xxx — decode a referral code to a telegram ID */
  @Get('decode')
  decodeCode(@Query('code') code: string) {
    if (!code) throw new BadRequestException('Missing code parameter');
    const telegramId = decodeReferralCode(code);
    if (telegramId === null) throw new BadRequestException('Invalid referral code');
    return { telegramId };
  }

  /** DELETE /referrals/by-invited/:telegramId */
  @Delete('by-invited/:telegramId')
  async deleteByInvitedId(@Param('telegramId', ParseIntPipe) telegramId: number) {
    await this.referralService.deleteByInvitedId(telegramId);
    return { deleted: true };
  }
}
