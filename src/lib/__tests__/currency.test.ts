import { describe, it, expect } from 'vitest';
import { getCurrencySymbol, formatCurrency, SUPPORTED_CURRENCIES } from '../currency';

describe('currency utilities', () => {
  it('should list supported currencies', () => {
    expect(SUPPORTED_CURRENCIES).toEqual([
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
      { code: 'USD', name: 'US Dollar', symbol: '$' },
    ]);
  });

  describe('getCurrencySymbol', () => {
    it('should return correct symbol for PHP', () => {
      expect(getCurrencySymbol('PHP')).toBe('₱');
      expect(getCurrencySymbol('php')).toBe('₱');
    });

    it('should return correct symbol for USD', () => {
      expect(getCurrencySymbol('USD')).toBe('$');
      expect(getCurrencySymbol('usd')).toBe('$');
    });

    it('should fallback to ₱ for unknown currency codes', () => {
      expect(getCurrencySymbol('EUR')).toBe('₱');
      expect(getCurrencySymbol('')).toBe('₱');
    });
  });

  describe('formatCurrency', () => {
    it('should format PHP amounts correctly', () => {
      expect(formatCurrency(1234.56, 'PHP')).toBe('₱1,234.56');
      expect(formatCurrency(0, 'PHP')).toBe('₱0.00');
    });

    it('should format USD amounts correctly', () => {
      expect(formatCurrency(99.9, 'USD')).toBe('$99.90');
    });

    it('should handle negative numbers by taking absolute value', () => {
      expect(formatCurrency(-50, 'USD')).toBe('$50.00');
    });

    it('should default to PHP if no currency code is provided', () => {
      expect(formatCurrency(100)).toBe('₱100.00');
    });
  });
});
