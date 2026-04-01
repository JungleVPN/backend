import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YookassaController } from '@payments/providers/yookassa/yookassa.controller';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { YookassaWebhookService } from '@payments/providers/yookassa/yookassa-webhook.service';
import { YookassaPayment } from '@workspace/database';

@Module({
  imports: [TypeOrmModule.forFeature([YookassaPayment])],
  controllers: [YookassaController],
  exports: [YooKassaProvider, YookassaWebhookService],
  providers: [YooKassaProvider, YookassaWebhookService],
})
export class YookassaModule {}
