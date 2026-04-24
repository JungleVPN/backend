import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ValidatePaymentRequest {
  constructor(readonly configService: ConfigService) {}

  validateAmount(value: string) {
    if (!value) {
      throw new BadRequestException('Amount is required');
    }

    const allowedAmounts = this.getAllowedAmounts();

    if (allowedAmounts.length === 0) {
      throw new BadRequestException('ALLOWED_AMOUNTS is not configured');
    }

    const requestedAmount = Number(value);

    if (!allowedAmounts.includes(requestedAmount)) {
      throw new BadRequestException(
        `Invalid amount: ${value}. Allowed values: ${allowedAmounts.join(', ')}`,
      );
    }
  }

  validatePeriod(value: number) {
    const allowedPeriods = this.getAllowedPeriods();

    if (allowedPeriods.length === 0) {
      throw new BadRequestException('ALLOWED_PERIODS is not configured');
    }

    if (!allowedPeriods.includes(value)) {
      throw new BadRequestException(
        `Invalid selectedPeriod: ${value}. Allowed values: ${allowedPeriods.join(', ')}`,
      );
    }
  }

  private getAllowedAmounts(): number[] {
    const envValue = this.configService.get<string>('ALLOWED_AMOUNTS', '');
    return (envValue || '')
      .split(',')
      .map((p) => Number(p.trim()))
      .filter((n) => n > 0);
  }

  private getAllowedPeriods(): number[] {
    const envValue = this.configService.get<string>('ALLOWED_PERIODS', '');
    return (envValue || '')
      .split(',')
      .map((p) => Number(p.trim()))
      .filter((p) => p > 0);
  }
}
