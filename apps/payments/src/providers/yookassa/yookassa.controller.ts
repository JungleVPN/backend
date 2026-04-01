import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { YookassaPayment } from '@workspace/database';
import { Repository } from 'typeorm';
import type { YookassaWebhookPayload } from './yookassa.model';
import { YooKassaProvider } from './yookassa.provider';
import type { CreateYookassaPaymentDto } from './yookassa.types';

@Controller('payments/yookassa')
export class YookassaController {
  constructor(
    @InjectRepository(YookassaPayment)
    private readonly yookassaPaymentRepo: Repository<YookassaPayment>,
    private readonly yookassaProvider: YooKassaProvider,
  ) {}

  /** List all Yookassa payments, newest first */
  @Get()
  async list() {
    return this.yookassaPaymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  /** Get a single Yookassa payment by id */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const payment = await this.yookassaPaymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Yookassa payment ${id} not found`);
    return payment;
  }

  /** Update a Yookassa payment status (and optional fields) */
  @Patch(':id')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status?: string; paidAt?: string | null },
  ) {
    const payment = await this.yookassaPaymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Yookassa payment ${id} not found`);

    if (body.status !== undefined) payment.status = body.status;
    if (body.paidAt !== undefined) payment.paidAt = body.paidAt ? new Date(body.paidAt) : null;

    return this.yookassaPaymentRepo.save(payment);
  }

  /** Create a one-time payment via Yookassa */
  @Post('create-session')
  async createSession(@Body() dto: CreateYookassaPaymentDto) {
    const session = await this.yookassaProvider.createPayment(dto);

    const record = this.yookassaPaymentRepo.create({
      id: session.id,
      url: session.url,
      status: 'pending',
      amount: +dto.payment.amount,
      currency: 'RUB',
      userId: dto.userId,
      description: dto.payment.description ?? null,
      metadata: dto.metadata ?? null,
      paidAt: null,
    });
    await this.yookassaPaymentRepo.save(record);

    return session;
  }

  /** Yookassa webhook endpoint — IP validated inside the provider */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() payload: YookassaWebhookPayload, @Ip() ip: string) {
    await this.yookassaProvider.handleWebhook(payload, ip);
    return { received: true };
  }
}
