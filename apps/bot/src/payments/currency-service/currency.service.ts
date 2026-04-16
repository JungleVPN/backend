import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentCurrency, PaymentPeriod, PaymentProvider } from '@shared/payments';

@Injectable()
export class CurrencyService {
  constructor(private readonly config: ConfigService) {}

  getPriceForPeriod(
    period: PaymentPeriod,
    provider: PaymentProvider,
  ): {
    amount: number | string;
    currency: PaymentCurrency;
  } {
    const rub = this.config.get<number>(`PRICE_RUB_${period.toUpperCase()}`);
    const eur = this.config.get<number>(`PRICE_EUR_${period.toUpperCase()}`);

    if (!rub || !eur) {
      throw new Error(`Missing price for period: ${period}`);
    }

    switch (provider) {
      case 'yookassa': {
        return { amount: rub, currency: 'RUB' };
      }
      default: {
        return { amount: eur, currency: 'EUR' };
      }
    }
  }
}
