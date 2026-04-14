import { Injectable } from '@nestjs/common';
import type { Payments } from '@workspace/types';
import { YooKassaConnector } from './helpers/yookassa.connector';

/**
 * Thin, well-typed client for the YooKassa payments API.
 *
 * Single `create()` method handles both one-shot (redirect confirmation) and
 * autopayment (payment_method_id) scenarios — the caller builds the request.
 *
 * Transport concerns (auth, retries, idempotency) live in `YooKassaConnector`.
 */
@Injectable()
export class YooKassaProvider {
  constructor(private readonly connector: YooKassaConnector) {}

  /**
   * Create a payment.
   *
   * One-shot payment: pass `confirmation` (usually redirect) and optionally
   * `save_payment_method: true` to persist the method for future autopayments.
   *
   * Autopayment: pass `payment_method_id` with `capture: true` and omit
   * `confirmation` — the charge is processed immediately without user action.
   *
   * @param request        Full YooKassa create-payment request
   * @param idempotenceKey Optional — auto-generated (uuid v4) if omitted
   */
  create(
    request: Payments.CreatePaymentRequest,
    idempotenceKey?: string,
  ): Promise<Payments.IPayment> {
    return this.connector.request<Payments.IPayment, Payments.CreatePaymentRequest>(
      'POST',
      '/',
      request,
      idempotenceKey,
    );
  }

  /** Fetch the current state of a payment by id. */
  getPayment(paymentId: string): Promise<Payments.IPayment> {
    return this.connector.request<Payments.IPayment>('GET', `/${paymentId}`);
  }
}
