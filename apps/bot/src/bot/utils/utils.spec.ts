import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isValidUsername,
  mapDeviceLabel,
  mapEURAmountToMonthsNumber,
  mapPeriodLabelToPriceLabel,
  mapPeriodToMonthsNumber,
  mapToClientAppName,
  mapToCorrectAmount,
  toDateString,
} from './utils';

describe('Utils', () => {
  describe('isValidUsername', () => {
    it('should return true for valid usernames', () => {
      expect(isValidUsername('valid_user_123')).toBe(true);
      expect(isValidUsername('User-Name')).toBe(true);
      expect(isValidUsername('12345')).toBe(true);
    });

    it('should return false for invalid usernames', () => {
      expect(isValidUsername('User Name')).toBe(false);
      expect(isValidUsername('User@Name')).toBe(false);
      expect(isValidUsername('')).toBe(false);
      expect(isValidUsername(undefined)).toBe(false);
      expect(isValidUsername(null)).toBe(false);
    });
  });

  describe('mapDeviceLabel', () => {
    it('should return mapped label for known devices', () => {
      expect(mapDeviceLabel('ios')).toBe('🍏 IOS');
      expect(mapDeviceLabel('android')).toBe('🤖 Android');
      expect(mapDeviceLabel('macOS')).toBe('💻 MacOS');
      expect(mapDeviceLabel('windows')).toBe('🖥 Windows');
    });

    it('should return passed value for unknown devices', () => {
      // @ts-expect-error
      expect(mapDeviceLabel('linux')).toBe('linux');
    });
  });

  describe('mapToClientAppName', () => {
    it('should return mapped label for known devices', () => {
      expect(mapToClientAppName('ios')).toBe('v2RayTun');
      expect(mapToClientAppName('android')).toBe('v2RayTun');
      expect(mapToClientAppName('macOS')).toBe('v2RayTun');
      expect(mapToClientAppName('windows')).toBe('Happ');
    });

    it('should return passed value for unknown devices', () => {
      // @ts-expect-error
      expect(mapToClientAppName('linux')).toBe('v2RayTun');
    });
  });

  describe('toDateString', () => {
    it('should format date string correctly to Russian locale', () => {
      // Testing a fixed date. Note: behavior depends on system time zone if not strictly mocked,
      // but the util uses 'Europe/Moscow', so we expect Moscow time.
      const dateStr = '2023-10-25T12:00:00Z';
      const result = toDateString(dateStr);
      // 12:00 UTC is 15:00 Moscow (UTC+3)
      expect(result).toMatch(/25\.10\.2023, 15:00/);
    });
  });

  describe('mapPeriodToMonthsNumber', () => {
    it('should return correct months for known periods', () => {
      expect(mapPeriodToMonthsNumber('month_1')).toBe(1);
      expect(mapPeriodToMonthsNumber('month_3')).toBe(3);
      expect(mapPeriodToMonthsNumber('month_6')).toBe(6);
    });

    it('should return default (1) for unknowns', () => {
      expect(mapPeriodToMonthsNumber(undefined)).toBe(1);
      // @ts-expect-error
      expect(mapPeriodToMonthsNumber('year_1')).toBe(1);
    });
  });

  describe('mapEURAmountToMonthsNumber', () => {
    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('should return correct months for exact amount strings', () => {
      vi.stubEnv('PRICE_EUR_MONTH_1', '100');
      vi.stubEnv('PRICE_EUR_MONTH_3', '250');
      vi.stubEnv('PRICE_EUR_MONTH_6', '450');

      expect(mapEURAmountToMonthsNumber('10000')).toBe(1); // 100.00 -> 10000
      expect(mapEURAmountToMonthsNumber('25000')).toBe(3);
      expect(mapEURAmountToMonthsNumber('45000')).toBe(6);
    });

    it('should return 1 for unknown amounts', () => {
      expect(mapEURAmountToMonthsNumber('99999')).toBe(1);
      expect(mapEURAmountToMonthsNumber(undefined)).toBe(1);
    });
  });

  describe('mapToCorrectAmount', () => {
    it('should strip last 2 digits', () => {
      expect(mapToCorrectAmount(12345)).toBe(123);
      expect(mapToCorrectAmount(100)).toBe(1);
    });
  });

  describe('mapPeriodLabelToPriceLabel', () => {
    it('should return correct key for periods', () => {
      expect(mapPeriodLabelToPriceLabel('month_1')).toBe('payment-period-button-label-1');
      expect(mapPeriodLabelToPriceLabel('month_3')).toBe('payment-period-button-label-2');
      expect(mapPeriodLabelToPriceLabel('month_6')).toBe('payment-period-button-label-3');
    });
  });
});
