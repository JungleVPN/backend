import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotNotificationModule } from '@payments/notifications/bot-notification.module';
import { PaymentStatusService } from '@payments/payment-status/payment-status.service';
import { YooKassaConnector } from '@payments/providers/yookassa/helpers/yookassa.connector';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { AutopaymentController } from './autopayment.controller';
import { AutopaymentService } from './autopayment.service';

@Module({
  imports: [TypeOrmModule.forFeature([SavedPaymentMethod, YookassaPayment]), BotNotificationModule],
  controllers: [AutopaymentController],
  exports: [AutopaymentService],
  providers: [YooKassaConnector, AutopaymentService, YooKassaProvider, PaymentStatusService],
})
export class AutopaymentModule {}
