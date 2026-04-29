import * as process from 'node:process';
import { Injectable, Logger } from '@nestjs/common';
import { CreateStripeSessionDto } from '@shared/payments';
import { createBackendClient } from '@utils/http-client';
import { CreateYookassaSessionDto, SavedMethodDto } from '@workspace/types';
import { AxiosInstance } from 'axios';

/**
 * HTTP client for the payments backend service (port 3001).
 * Each provider has its own endpoint matching the BE controller contract.
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  private backend: AxiosInstance = createBackendClient(
    process.env.PAYMENTS_URL || 'http://localhost:3001',
  );

  async createStripeSession(dto: CreateStripeSessionDto) {
    const res = await this.backend.post('/payments/stripe/create-session', dto);

    if (res.status >= 400) {
      this.logger.error(`Stripe session failed: ${res.status} ${JSON.stringify(res.data)}`);
      throw new Error(`Stripe payment creation failed: ${res.status}`);
    }

    return res.data;
  }

  async createYookassaSession(dto: CreateYookassaSessionDto) {
    const res = await this.backend.post('/payments/yookassa/create-session', dto);

    if (res.status >= 400) {
      this.logger.error(`Yookassa session failed: ${res.status} ${JSON.stringify(res.data)}`);
      throw new Error(`Yookassa payment creation failed: ${res.status}`);
    }

    return res.data;
  }

  /**
   * Hard-deletes a saved payment method (YooKassa). The backend requires both
   * `telegramId` and the method's primary id so one user can't delete another
   * user's record.
   *
   * Returns `true` on success and `false` for any non-2xx response or network
   * error — callers decide whether to show an error toast or just re-render.
   */
  async deleteSavedPaymentMethod(telegramId: string, methodId: string): Promise<boolean> {
    try {
      const res = await this.backend.delete(
        `/payments/yookassa/saved-methods/${telegramId}/${methodId}`,
      );

      if (res.status >= 400) {
        this.logger.warn(
          `Delete saved method failed for ${telegramId}/${methodId}: ${res.status} ${JSON.stringify(res.data)}`,
        );
        return false;
      }

      return true;
    } catch (err: any) {
      this.logger.warn(
        `Delete saved method errored for ${telegramId}/${methodId}: ${err?.message ?? err}`,
      );
      return false;
    }
  }

  /**
   * Fetches active saved payment methods for a user (YooKassa only today —
   * Stripe has no equivalent concept of "saved methods" on the backend yet).
   *
   * Returns an empty array on any error so callers can treat "no method"
   * identically to "BE unreachable" — the profile screen shouldn't fail just
   * because we couldn't enrich it with autopayment info.
   */
  async getSavedPaymentMethods(telegramId: string): Promise<SavedMethodDto[]> {
    try {
      const res = await this.backend.get(`/payments/yookassa/saved-methods/${telegramId}`);

      if (res.status >= 400) {
        this.logger.warn(
          `Fetch saved methods failed for ${telegramId}: ${res.status} ${JSON.stringify(res.data)}`,
        );
        return [];
      }

      return Array.isArray(res.data) ? res.data : [];
    } catch (err: any) {
      this.logger.warn(`Fetch saved methods errored for ${telegramId}: ${err?.message ?? err}`);
      return [];
    }
  }
}
