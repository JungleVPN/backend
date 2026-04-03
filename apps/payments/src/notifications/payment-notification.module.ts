import { Module } from '@nestjs/common';
import { PaymentNotificationService } from './payment-notification.service';

@Module({
  providers: [PaymentNotificationService],
  exports: [PaymentNotificationService],
})
export class PaymentNotificationModule {}
