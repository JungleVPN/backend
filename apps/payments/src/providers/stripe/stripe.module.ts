import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripePayment } from '@workspace/database';
import { StripeProvider } from '@payments/providers/stripe/stripe.provider';
import { StripeWebhookService } from '@payments/providers/stripe/stripe-webhook.service';
import { StripeController } from '@payments/providers/stripe/stripe.controller';
import { PaymentStatusModule } from '../../payment-status/payment-status.module';

@Module({
  imports: [TypeOrmModule.forFeature([StripePayment]), PaymentStatusModule],
  controllers: [StripeController],
  exports: [StripeProvider, StripeWebhookService],
  providers: [StripeProvider, StripeWebhookService],
})
export class StripeModule {}
