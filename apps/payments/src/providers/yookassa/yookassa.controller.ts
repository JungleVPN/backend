import * as process from 'node:process';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  Ip,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { YookassaService } from '@payments/providers/yookassa/yookassa.service';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import {
  type MakeAutopaymentDto,
  PaymentSession,
  Payments,
  type PaymentWebhookNotification,
  WebhookEventEnum,
} from '@workspace/types';
import { Repository } from 'typeorm';
import { YooKassaProvider } from './yookassa.provider';

@Controller('payments/yookassa')
export class YookassaController {
  private readonly logger = new Logger(YookassaController.name);

  constructor(
    @InjectRepository(YookassaPayment)
    private readonly yookassaPaymentRepo: Repository<YookassaPayment>,
    @InjectRepository(SavedPaymentMethod)
    private readonly savedMethodRepo: Repository<SavedPaymentMethod>,
    private readonly yookassaService: YookassaService,
    private readonly yookassaProvider: YooKassaProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /** Yookassa webhook endpoint — IP validated inside the provider */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() payload: PaymentWebhookNotification, @Ip() ip: string) {
    await this.yookassaService.handleWebhook(payload, ip);
    return { ok: true };
  }

  // ── Saved payment methods (must be before :id to avoid route conflicts) ─

  /** List active saved payment methods for a user */
  @Get('saved-methods/:userId')
  async getSavedMethods(@Param('userId') userId: string) {
    return this.savedMethodRepo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Hard-delete a saved payment method owned by `userId`.
   *
   * The `userId` is part of the route (not just the id) so a user cannot
   * delete someone else's saved method by guessing an id. 404 if the row
   * doesn't exist or belongs to a different user.
   */
  @Delete('saved-methods/:userId/:id')
  async deleteSavedMethod(
    @Param('userId') userId: string,
    @Param('id') id: string,
  ): Promise<{ ok: true }> {
    await this.yookassaService.deletePaymentMethod(id, userId);
    return { ok: true };
  }

  // ── Payments ───────────────────────────────────────────────────────

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
    @Body() body: { status?: Payments.PaymentStatus; paidAt?: string | null },
  ) {
    const payment = await this.yookassaPaymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Yookassa payment ${id} not found`);

    if (body.status !== undefined) payment.status = body.status;
    if (body.paidAt !== undefined) payment.paidAt = body.paidAt ? new Date(body.paidAt) : null;

    return this.yookassaPaymentRepo.save(payment);
  }

  /**
   * Create a one-shot payment session via YooKassa.
   * Saves the payment method by default UNLESS the user has explicitly opted out
   * (i.e. they previously had saved methods but disabled all of them).
   */
  @Post('create-session')
  async createSession(
    @Body()
    body: Payments.CreatePaymentRequest,
  ): Promise<PaymentSession> {
    const request: Payments.CreatePaymentRequest = {
      ...body,
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url:
          body.confirmation?.type === 'redirect'
            ? body.confirmation.return_url
            : process.env.RETURN_URL,
      },
    };

    const payment = await this.yookassaProvider.create(request);
    const confirmationUrl = this.extractRedirectUrl(payment);

    if (!confirmationUrl) {
      throw new InternalServerErrorException(
        `YooKassa did not return a confirmation URL for payment ${payment.id}`,
      );
    }

    if (!body.metadata) {
      throw new InternalServerErrorException('No payment metadata found');
    }

    const userId = String(body.metadata?.userId);

    const record = this.yookassaPaymentRepo.create({
      id: payment.id,
      url: confirmationUrl,
      status: payment.status,
      amount: Number(request.amount.value),
      currency: 'RUB',
      userId,
      description: payment.description ?? null,
      metadata: payment.metadata ?? null,
      paidAt: null,
    });
    await this.yookassaPaymentRepo.save(record);

    this.logger.log(`Created Yookassa payment session ${payment.id} for user ${userId}`);
    return { id: payment.id, url: confirmationUrl };
  }

  // ── Autopayment ────────────────────────────────────────────────────

  /**
   * Trigger an autopayment using a saved payment method.
   * Called by the bot when a subscription is about to expire (user.expires_in_24_hours).
   *
   * Flow:
   * 1. Validate that the saved method exists and is active
   * 2. Create an autopayment via YooKassa (no user confirmation needed)
   * 3. Store the payment record
   * 4. If failed — emit AUTOPAYMENT_FAILED so the bot can fall back to manual payment
   */
  @Post('make-autopayment')
  async makeAutopayment(@Body() dto: MakeAutopaymentDto): Promise<Payments.IPayment> {
    const savedMethod = await this.savedMethodRepo.findOneBy({
      userId: dto.userId,
      isActive: true,
    });

    if (!savedMethod) {
      throw new NotFoundException(`No active saved payment method for user ${dto.userId}`);
    }

    const metadata = {
      telegramId: dto.telegramId,
      selectedPeriod: dto.selectedPeriod,
      userId: dto.userId,
    };

    const request: Payments.CreatePaymentRequest = {
      amount: { value: String(dto.amount), currency: 'RUB' },
      capture: true,
      payment_method_id: savedMethod.paymentMethodId,
      description:
        dto.description || process.env.PAYMENT_DESCRIPTION || 'Happy to see you in the JUNGLE 🌴',
      metadata,
    };

    const payment = await this.yookassaProvider.create(request);

    // Store the payment record regardless of outcome
    const record = this.yookassaPaymentRepo.create({
      id: payment.id,
      status: payment.status,
      amount: dto.amount,
      userId: savedMethod.userId,
      description: request.description ?? null,
      metadata: request.metadata ?? null,
      paidAt: payment.status === 'succeeded' ? new Date() : null,
    });
    await this.yookassaPaymentRepo.save(record);

    // If the autopayment was immediately canceled, emit failure event
    if (payment.status === 'canceled' && payment.cancellation_details) {
      this.eventEmitter.emit(WebhookEventEnum['payment.autopayment_failed'], {
        telegramId: Number(dto.userId),
        provider: 'yookassa',
        reason: payment.cancellation_details.reason,
      } satisfies Payments.PaymentFailedEventPayload);

      this.logger.warn(
        `Autopayment failed for user ${dto.userId}: ${payment.cancellation_details.reason}`,
      );
    }

    return payment;
  }

  /** Narrow `confirmation` to the `redirect` variant and return its URL, if any. */
  private extractRedirectUrl(payment: Payments.IPayment): string | undefined {
    const { confirmation } = payment;
    if (confirmation && confirmation.type === 'redirect') {
      return confirmation.confirmation_url;
    }
    return undefined;
  }
}
