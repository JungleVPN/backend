import { Module } from '@nestjs/common';
import { CurrencyService } from './currency-service/currency.service';
import { PaymentsService } from './payments.service';

@Module({
  providers: [PaymentsService, CurrencyService],
  exports: [PaymentsService, CurrencyService],
})
export class PaymentsModule {}
