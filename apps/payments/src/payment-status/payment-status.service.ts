import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { GetUserByUuidResponseDto } from '@workspace/types';
import axios from 'axios';

/**
 * Orchestrates post-payment business logic via HTTP calls to other services.
 *
 * Lives in the payments app because payment events originate here.
 * Calls remnawave to extend user subscription, and referrals to trigger rewards.
 */
@Injectable()
export class PaymentStatusService {
  private readonly logger = new Logger(PaymentStatusService.name);

  private get remnawareBaseUrl(): string {
    return process.env.REMNAWAVE_URL || 'http://localhost:3002';
  }

  private get referralsBaseUrl(): string {
    return process.env.REFERRALS_URL || 'http://localhost:3004';
  }

  /**
   * Called after a successful payment (Stripe or Yookassa).
   * Looks up user by email (web), telegramId (bot), or userId (uuid), in that priority order.
   * 1. Fetches user from remnawave
   * 2. Extends subscription via remnawave PATCH /users
   * 3. Triggers referral reward via referrals POST /referrals/reward-after-payment
   */
  // ToDo remove and add update expiryData method on BE side
  async handlePaymentSucceeded({
    selectedPeriod,
    userId,
  }: {
    selectedPeriod: number;
    userId: string;
  }): Promise<{ success: boolean }> {
    const user = await this.getUserByUuid(userId);

    if (!user) {
      this.logger.warn(`User not found: userId=${userId}`);
      return { success: false };
    }

    const newExpiry = this.addMonths(user.expireAt, selectedPeriod);

    await this.updateUserExpiry(user.uuid, newExpiry);

    if (user.telegramId) {
      await this.triggerReferralReward(user.telegramId);
    }

    this.logger.log(`Payment processed for user ${user.uuid}: +${selectedPeriod} month(s)`);

    return { success: true };
  }

  private async getUserByUuid(uuid: string): Promise<GetUserByUuidResponseDto | null> {
    try {
      const { data } = await axios.get<GetUserByUuidResponseDto>(
        `${this.remnawareBaseUrl}/api/users/${uuid}`,
        {
          headers: {
            'x-service-secret': process.env.INTER_SERVICE_SECRET,
          },
        },
      );
      return data ?? null;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      this.logger.error(`Failed to fetch user by uuid ${uuid}: ${err.message}`);
      throw err;
    }
  }

  private async updateUserExpiry(uuid: string, expireAt: Date): Promise<void> {
    await axios.patch(
      `${this.remnawareBaseUrl}/api/users`,
      {
        uuid,
        expireAt: expireAt.toISOString(),
      },
      {
        headers: {
          'x-service-secret': process.env.INTER_SERVICE_SECRET,
        },
      },
    );
  }

  private async triggerReferralReward(telegramId: number): Promise<boolean> {
    try {
      const { data } = await axios.post<{ rewarded: boolean }>(
        `${this.referralsBaseUrl}/referrals/reward-after-payment`,
        { invitedTelegramId: telegramId },
        {
          headers: {
            'x-service-secret': process.env.INTER_SERVICE_SECRET,
          },
        },
      );
      return data.rewarded;
    } catch (err: any) {
      this.logger.warn(`Referral reward failed for ${telegramId}: ${err.message}`);
      return false;
    }
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
}
