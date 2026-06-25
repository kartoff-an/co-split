export const SUPPORTED_CURRENCIES = [
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
];

export const getCurrencySymbol = (code: string): string => {
  const match = SUPPORTED_CURRENCIES.find((c) => c.code === code.toUpperCase());
  return match ? match.symbol : '₱';
};

export const formatCurrency = (
  amount: number,
  currencyCode: string = 'PHP'
): string => {
  const code = currencyCode.toUpperCase();
  const absAmount = Math.abs(amount);
  const symbol = getCurrencySymbol(code);
  return `${symbol}${absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
