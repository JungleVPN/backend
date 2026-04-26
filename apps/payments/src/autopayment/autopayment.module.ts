import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentStatusService } from '@payments/payment-status/payment-status.service';
import { YooKassaConnector } from '@payments/providers/yookassa/helpers/yookassa.connector';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { ValidatePaymentRequest } from '@payments/utils/utils';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { AutopaymentController } from './autopayment.controller';
import { AutopaymentService } from './autopayment.service';

@Module({
  imports: [TypeOrmModule.forFeature([SavedPaymentMethod, YookassaPayment])],
  controllers: [AutopaymentController],
  exports: [AutopaymentService],
  providers: [
    YooKassaConnector,
    AutopaymentService,
    YooKassaProvider,
    PaymentStatusService,
    ValidatePaymentRequest,
  ],
})
export class AutopaymentModule {}
