import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import type { YookassaPaymentStatus } from './yookassa.model';
import type {
  AutopaymentApiResponse,
  CreateAutopaymentInternalDto,
  CreateYookassaPaymentDto,
  YookassaPaymentSession,
} from './yookassa.types';

@Injectable()
export class YooKassaProvider {
  private yookassaApi: AxiosInstance = axios.create({
    baseURL: process.env.YOOKASSA_URL,
    withCredentials: true,
    validateStatus: () => true,
    headers: {
      'Content-Type': 'application/json',
    },
    auth: {
      username: process.env.YOOKASSA_SHOP_ID || '',
      password: process.env.YOOKASSA_API_KEY || '',
    },
  });

  async createPayment(dto: CreateYookassaPaymentDto): Promise<YookassaPaymentSession> {
    try {
      const body: Record<string, unknown> = {
        amount: {
          value: dto.payment.amount,
          currency: 'RUB',
        },
        capture: true,
        confirmation: {
          type: 'redirect',
          return_url: process.env.RETURN_URL,
        },
        description: dto.payment.description,
        metadata: dto.metadata,
      };

      if (dto.savePaymentMethod) {
        body.save_payment_method = true;
      }

      const { data } = await this.yookassaApi.post('/', body, {
        headers: {
          'Idempotence-Key': crypto.randomUUID(),
        },
      });

      return {
        id: data.id,
        url: data.confirmation.confirmation_url,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Creates an autopayment using a previously saved payment method.
   * No confirmation/redirect needed — the charge is processed immediately.
   */
  async createAutopayment(dto: CreateAutopaymentInternalDto): Promise<AutopaymentApiResponse> {
    const { data } = await this.yookassaApi.post(
      '/',
      {
        amount: {
          value: String(dto.amount),
          currency: 'RUB',
        },
        capture: true,
        payment_method_id: dto.paymentMethodId,
        description: dto.description || 'Autopayment for VPN subscription',
        metadata: {
          telegramId: dto.userId,
          selectedPeriod: dto.selectedPeriod,
        },
      },
      {
        headers: {
          'Idempotence-Key': crypto.randomUUID(),
        },
      },
    );

    return data;
  }

  async checkPaymentStatus(paymentId: string): Promise<YookassaPaymentStatus> {
    try {
      const { data } = await this.yookassaApi.get(`/${paymentId}`);
      return data.status;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }
}
