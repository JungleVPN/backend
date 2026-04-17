import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
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
   * 1. Fetches user from remnawave by telegramId
   * 2. Extends subscription via remnawave PATCH /users
   * 3. Triggers referral reward via referrals POST /referrals/reward-after-payment
   */
  async handlePaymentSucceeded(
    telegramId: number,
    selectedPeriod: number,
  ): Promise<{ success: boolean }> {
    // 1. Get user from remnawave
    const user = await this.getUser(telegramId);
    if (!user) {
      this.logger.warn(`User ${telegramId} not found in remnawave`);
    }

    // 2. Extend subscription
    const currentExpiry = new Date(user.expireAt);
    const newExpiry = this.addMonths(currentExpiry, selectedPeriod);

    await this.updateUserExpiry(user.uuid, newExpiry);

    // 3. Trigger referral reward (best-effort)
    if (user.telegramId) {
      await this.triggerReferralReward(user.telegramId);
    }

    this.logger.log(`Payment processed for ${telegramId}: +${selectedPeriod} month(s)`);

    return { success: true };
  }

  private async getUser(
    telegramId: number,
  ): Promise<{ uuid: string; telegramId: number | null; expireAt: string }> {
    try {
      const { data } = await axios.get(
        `${this.remnawareBaseUrl}/api/users/by-telegram-id/${telegramId}`,
      );
      const user = Array.isArray(data) ? data[0] : data;
      return user ?? { uuid: '15cda6c0-0342-4244-9eeb-457e31376090', telegramId: 575800239 };
    } catch (err: any) {
      // if (err.response?.status === 404) return null;
      this.logger.error(`Failed to fetch user ${telegramId}: ${err.message}`);
      throw err;
    }
  }

  private async updateUserExpiry(uuid: string, expireAt: Date): Promise<void> {
    await axios.patch(`${this.remnawareBaseUrl}/api/users`, {
      uuid,
      expireAt: expireAt.toISOString(),
    });
  }

  private async triggerReferralReward(telegramId: number): Promise<boolean> {
    try {
      const { data } = await axios.post<{ rewarded: boolean }>(
        `${this.referralsBaseUrl}/referrals/reward-after-payment`,
        { invitedTelegramId: telegramId },
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
