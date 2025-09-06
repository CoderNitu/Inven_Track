// Currency conversion utilities
export const EXCHANGE_RATES = {
  INR: 1,      // Base currency
  USD: 0.012,  // 1 INR = 0.012 USD
  EUR: 0.011,  // 1 INR = 0.011 EUR
};

export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return Number(amount) || 0;
  
  const numAmount = Number(amount) || 0;
  if (numAmount === 0) return 0;
  
  // Convert to INR first, then to target currency
  const inrAmount = fromCurrency === 'INR' ? numAmount : numAmount / EXCHANGE_RATES[fromCurrency];
  const convertedAmount = toCurrency === 'INR' ? inrAmount : inrAmount * EXCHANGE_RATES[toCurrency];
  
  return convertedAmount;
};

export const formatCurrency = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency];
  const convertedAmount = convertCurrency(Number(amount) || 0, 'INR', currency);
  return `${symbol}${convertedAmount.toFixed(2)}`;
};

export const getExchangeRate = (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;
  
  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];
  
  return toRate / fromRate;
};
