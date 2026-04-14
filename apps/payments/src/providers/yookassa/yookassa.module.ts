import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutopaymentModule } from '@payments/autopayment/autopayment.module';
import { BotNotificationModule } from '@payments/notifications/bot-notification.module';
import { YooKassaConnector } from '@payments/providers/yookassa/helpers/yookassa.connector';
import { YookassaController } from '@payments/providers/yookassa/yookassa.controller';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { YookassaService } from '@payments/providers/yookassa/yookassa.service';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { PaymentStatusModule } from '../../payment-status/payment-status.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([YookassaPayment, SavedPaymentMethod]),
    PaymentStatusModule,
    AutopaymentModule,
    BotNotificationModule,
  ],
  controllers: [YookassaController],
  exports: [YooKassaProvider, YookassaService],
  providers: [YooKassaConnector, YooKassaProvider, YookassaService],
})
export class YookassaModule {}
