import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YooKassaProvider } from '@payments/providers/yookassa/yookassa.provider';
import { SavedPaymentMethod, YookassaPayment } from '@workspace/database';
import { AutopaymentController } from './autopayment.controller';
import { AutopaymentService } from './autopayment.service';

@Module({
  imports: [TypeOrmModule.forFeature([SavedPaymentMethod, YookassaPayment])],
  controllers: [AutopaymentController],
  providers: [AutopaymentService, YooKassaProvider],
})
export class AutopaymentModule {}
