import { mapEURAmountToMonthsNumber, mapToCorrectAmount } from '@workspace/utils';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { StripeInvoicePayload } from './stripe.types';
import { StripeProvider } from './stripe.provider';
import { customerToId, subscriptionToId } from './stripe.utils';
import Stripe from 'stripe';

@Injectable()
export class StripeWebhookService {
  constructor(
    private eventEmitter: EventEmitter2,
    @Inject(forwardRef(() => StripeProvider))
    private stripeProvider: StripeProvider,
  ) {}

  async handleWebhook(event: Stripe.Event) {
    switch (event.type) {
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await this.handleInvoiceEvent(event);
        break;
    }
  }

  private async handleInvoiceEvent(event: Stripe.Event) {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = customerToId(invoice.customer);
    const subscriptionId = subscriptionToId(invoice.parent?.subscription_details?.subscription);

    const customer = await this.stripeProvider.retrieveCustomer(customerId);

    const isSuccess = event.type === 'invoice.payment_succeeded';
    const amountVal = isSuccess ? invoice.amount_paid : invoice.amount_due;
    const paidAt = isSuccess ? new Date() : null;
    const amount = mapToCorrectAmount(amountVal);

    const fallbackStatus = isSuccess ? 'paid' : 'open';

    const monthsToAdd = mapEURAmountToMonthsNumber(amountVal.toString());

    if (customer && !customer.deleted) {
      const payload: StripeInvoicePayload = {
        id: invoice.id,
        stripeSubscriptionId: subscriptionId,
        status: invoice.status || fallbackStatus,
        amount,
        stripeCustomerId: customer.id,
        invoiceUrl: invoice.hosted_invoice_url || null,
        metadata: {
          ...customer.metadata,
          telegramId: customer.metadata.telegramId,
          selectedPeriod: monthsToAdd.toString(),
        },
        userId: customer.metadata.telegramId,
        currency: 'EUR',
        paidAt,
        url: null,
      };

      this.eventEmitter.emit(event.type, {
        type: 'notification',
        event: event.type,
        object: payload,
      });
    }
  }
}
