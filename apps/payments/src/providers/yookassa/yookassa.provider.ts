import * as process from 'node:process';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import type { YookassaPaymentStatus, YookassaWebhookPayload } from './yookassa.model';
import type { CreateYookassaPaymentDto, YookassaPaymentSession } from './yookassa.types';
import { YookassaWebhookService } from './yookassa-webhook.service';

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

  constructor(readonly yookassaWebhookService: YookassaWebhookService) {}

  async createPayment(dto: CreateYookassaPaymentDto): Promise<YookassaPaymentSession> {
    try {
      const { data } = await this.yookassaApi.post(
        '/',
        {
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
        },
        {
          headers: {
            'Idempotence-Key': crypto.randomUUID(),
          },
        },
      );

      return {
        id: data.id,
        url: data.confirmation.confirmation_url,
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  async handleWebhook(payload: YookassaWebhookPayload, ip: string): Promise<void> {
    await this.yookassaWebhookService.handleWebhook(payload, ip);
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
