import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Referral } from '@workspace/database';
import { add } from 'date-fns';
import { Repository } from 'typeorm';
import { generateReferralCode } from './referral.utils';
import { RemnaClient } from './remna.client';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectRepository(Referral)
    private readonly referralRepository: Repository<Referral>,
    private readonly remnaClient: RemnaClient,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getReferralByInvitedId(invitedId: number): Promise<Referral | null> {
    return this.referralRepository.findOne({ where: { invitedId } });
  }

  async createReferralRecord(inviterId: number, invitedId: number): Promise<Referral> {
    const referral = this.referralRepository.create({
      inviterId,
      invitedId,
      status: 'FIRST_REWARD',
    });
    return this.referralRepository.save(referral);
  }

  /**
   * Handles new user registration via referral link.
   * Creates the invited user (via remnawave HTTP), records the referral, and rewards the inviter.
   */
  async handleNewUser(
    inviterId: number,
    invitedTelegramId: number,
    locale?: string,
  ): Promise<{ success: boolean; reason?: string }> {
    if (inviterId === invitedTelegramId) {
      this.logger.warn(`User ${invitedTelegramId} tried to refer themselves.`);
      return { success: false, reason: 'self_referral' };
    }

    const existingUser = await this.remnaClient.getUserByTgId(invitedTelegramId);
    if (existingUser) {
      this.logger.warn(`Invited user ${invitedTelegramId} is not new.`);
      return { success: false, reason: 'user_exists' };
    }

    const inviter = await this.remnaClient.getUserByTgId(inviterId);
    if (!inviter?.telegramId) {
      this.logger.warn(`Inviter ${inviterId} not found.`);
      return { success: false, reason: 'inviter_not_found' };
    }

    const invited = await this.remnaClient.createUser({
      username: invitedTelegramId.toString(),
      telegramId: invitedTelegramId,
      description: locale ?? undefined,
    });

    if (!invited?.telegramId) {
      this.logger.warn(`Failed to create invited user ${invitedTelegramId}.`);
      return { success: false, reason: 'user_creation_failed' };
    }

    await this.createReferralRecord(inviter.telegramId, invited.telegramId);

    const bonusDays = Number(process.env.INVITER_START_BONUS_IN_DAYS || '3');
    await this.rewardUser(inviter.telegramId, bonusDays, true);

    return { success: true };
  }

  /**
   * Rewards the inviter after the invited user makes their first payment.
   * Sets referral status to COMPLETED to prevent duplicate rewards.
   */
  async handleInviterRewardAfterPayment(
    invitedTelegramId: number,
  ): Promise<{ rewarded: boolean; reason?: string }> {
    const invited = await this.remnaClient.getUserByTgId(invitedTelegramId);
    if (!invited?.telegramId) {
      this.logger.warn(`Invited user ${invitedTelegramId} not found.`);
      return { rewarded: false, reason: 'invited_not_found' };
    }

    const referral = await this.referralRepository.findOne({
      where: { invitedId: invited.telegramId },
    });

    if (!referral) {
      return { rewarded: false, reason: 'no_referral' };
    }

    if (referral.status === 'COMPLETED') {
      this.logger.log(
        `Inviter ${referral.inviterId} already received all bonuses for ${invitedTelegramId}`,
      );
      return { rewarded: false, reason: 'already_completed' };
    }

    const bonusDays = Number(process.env.INVITER_PAID_BONUS_IN_DAYS || '7');
    await this.rewardUser(referral.inviterId, bonusDays, false);

    referral.status = 'COMPLETED';
    await this.referralRepository.save(referral);

    return { rewarded: true };
  }

  async deleteByInvitedId(invitedId: number): Promise<void> {
    await this.referralRepository.delete({ invitedId });
  }

  getReferralLink(telegramId: number): string {
    const code = generateReferralCode(telegramId);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME;
    return `https://t.me/${botUsername}?start=ref_${code}`;
  }

  private async rewardUser(inviterId: number, days: number, isNewUser: boolean): Promise<void> {
    const user = await this.remnaClient.getUserByTgId(inviterId);
    if (!user) return;

    const newExpireAt = add(new Date(user.expireAt), { days });

    await this.remnaClient.updateUser({
      uuid: user.uuid,
      expireAt: newExpireAt,
    });

    this.eventEmitter.emit('user.rewarded', { id: user.telegramId, isNewUser });
    this.logger.log(`Rewarded inviter ${inviterId} with ${days} day(s)`);
  }
}
