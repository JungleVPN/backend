import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Ip,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import type { CreateAutopaymentDto } from '@workspace/types';
import { Repository } from 'typeorm';
import { type AutopaymentFailedEvent, PAYMENT_EVENTS } from '../../notifications/payment-events';
import type { YookassaWebhookPayload } from './yookassa.model';
import { YooKassaProvider } from './yookassa.provider';
import type { CreateYookassaPaymentDto } from './yookassa.types';

@Controller('payments/yookassa')
export class YookassaController {
  private readonly logger = new Logger(YookassaController.name);

  constructor(
    @InjectRepository(YookassaPayment)
    private readonly yookassaPaymentRepo: Repository<YookassaPayment>,
    @InjectRepository(SavedPaymentMethod)
    private readonly savedMethodRepo: Repository<SavedPaymentMethod>,
    private readonly yookassaProvider: YooKassaProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // ── Saved payment methods (must be before :id to avoid route conflicts) ─

  /** List active saved payment methods for a user */
  @Get('saved-methods/:userId')
  async getSavedMethods(@Param('userId') userId: string) {
    return this.savedMethodRepo.find({
      where: { userId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  /** Disable a saved payment method (soft-delete) */
  @Delete('saved-methods/:id')
  async disableSavedMethod(@Param('id') id: string) {
    const method = await this.savedMethodRepo.findOneBy({ id });
    if (!method) {
      throw new NotFoundException(`Saved payment method ${id} not found`);
    }

    method.isActive = false;
    await this.savedMethodRepo.save(method);

    this.logger.log(`Disabled saved payment method ${id} for user ${method.userId}`);
    return { disabled: true };
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
    @Body() body: { status?: string; paidAt?: string | null },
  ) {
    const payment = await this.yookassaPaymentRepo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Yookassa payment ${id} not found`);

    if (body.status !== undefined) payment.status = body.status;
    if (body.paidAt !== undefined) payment.paidAt = body.paidAt ? new Date(body.paidAt) : null;

    return this.yookassaPaymentRepo.save(payment);
  }

  /**
   * Create a payment via Yookassa.
   * Saves payment method by default UNLESS the user has explicitly opted out
   * (i.e. they previously had saved methods but disabled all of them).
   */
  @Post('create-session')
  async createSession(@Body() dto: CreateYookassaPaymentDto) {
    let savePaymentMethod = dto.savePaymentMethod;
    // If caller didn't explicitly set savePaymentMethod, decide based on opt-out status
    if (savePaymentMethod === undefined) {
      savePaymentMethod = !(await this.hasUserOptedOutOfAutopayments(dto.userId));
    }

    const session = await this.yookassaProvider.createPayment({
      ...dto,
      savePaymentMethod,
    });

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

    this.logger.log(`Created Yookassa payment session ${session.id} for user`);
    return session;
  }

  /** Yookassa webhook endpoint — IP validated inside the provider */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() payload: YookassaWebhookPayload, @Ip() ip: string) {
    await this.yookassaProvider.handleWebhook(payload, ip);
    return { received: true };
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
  @Post('autopayment')
  async createAutopayment(@Body() dto: CreateAutopaymentDto) {
    const savedMethod = await this.savedMethodRepo.findOneBy({
      paymentMethodId: dto.paymentMethodId,
      userId: dto.userId,
      isActive: true,
    });

    if (!savedMethod) {
      throw new NotFoundException(
        `No active saved payment method ${dto.paymentMethodId} for user ${dto.userId}`,
      );
    }

    const result = await this.yookassaProvider.createAutopayment({
      userId: dto.userId,
      paymentMethodId: dto.paymentMethodId,
      amount: dto.amount,
      selectedPeriod: dto.selectedPeriod,
      description: dto.description,
    });

    // Store the payment record regardless of outcome
    const record = this.yookassaPaymentRepo.create({
      id: result.id,
      url: null,
      status: result.status,
      amount: +dto.amount,
      currency: 'RUB',
      userId: dto.userId,
      description: dto.description ?? 'Autopayment for VPN subscription',
      metadata: {
        telegramId: dto.userId,
        selectedPeriod: dto.selectedPeriod,
        isAutopayment: true,
        paymentMethodId: dto.paymentMethodId,
      },
      paidAt: result.status === 'succeeded' ? new Date() : null,
    });
    await this.yookassaPaymentRepo.save(record);

    // If the autopayment was immediately canceled, emit failure event
    if (result.status === 'canceled' && result.cancellation_details) {
      this.eventEmitter.emit(PAYMENT_EVENTS.AUTOPAYMENT_FAILED, {
        telegramId: Number(dto.userId),
        provider: 'yookassa',
        selectedPeriod: dto.selectedPeriod,
        reason: result.cancellation_details.reason,
        party: result.cancellation_details.party,
      } satisfies AutopaymentFailedEvent);

      this.logger.warn(
        `Autopayment failed for user ${dto.userId}: ${result.cancellation_details.reason}`,
      );
    }

    return {
      paymentId: result.id,
      status: result.status,
      cancellationDetails: result.cancellation_details,
    };
  }

  // ── Helpers ────────────────────────────────────────────────────────

  /**
   * A user has opted out of autopayments if they have at least one saved
   * payment method record (active or not) but ZERO active ones.
   *
   * - No records at all → new user, NOT opted out (autopayments enabled by default)
   * - Some records, all inactive → explicitly opted out
   * - At least one active record → NOT opted out
   */
  private async hasUserOptedOutOfAutopayments(userId: string): Promise<boolean> {
    const totalCount = await this.savedMethodRepo.count({
      where: { userId, provider: 'yookassa' },
    });

    if (totalCount === 0) return false;

    const activeCount = await this.savedMethodRepo.count({
      where: { userId, provider: 'yookassa', isActive: true },
    });

    return activeCount === 0;
  }
}
