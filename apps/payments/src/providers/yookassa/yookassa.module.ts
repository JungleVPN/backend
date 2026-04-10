import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YookassaController } from '@payments/providers/yookassa/yookassa.controller';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { YookassaWebhookService } from '@payments/providers/yookassa/yookassa-webhook.service';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { PaymentStatusModule } from '../../payment-status/payment-status.module';

@Module({
  imports: [TypeOrmModule.forFeature([YookassaPayment, SavedPaymentMethod]), PaymentStatusModule],
  controllers: [YookassaController],
  exports: [YooKassaProvider, YookassaWebhookService],
  providers: [YooKassaProvider, YookassaWebhookService],
})
export class YookassaModule {}
