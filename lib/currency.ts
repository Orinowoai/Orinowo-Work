export interface CurrencyConfig {
  code: string
  symbol: string
  rate: number // Conversion rate from USD (base)
}

export const currencies: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', rate: 1 },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79 },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92 },
  NGN: { code: 'NGN', symbol: '₦', rate: 1534 },
  ZAR: { code: 'ZAR', symbol: 'R', rate: 18 },
  JPY: { code: 'JPY', symbol: '¥', rate: 149 },
  INR: { code: 'INR', symbol: '₹', rate: 83 },
  BRL: { code: 'BRL', symbol: 'R$', rate: 4.9 },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.51 },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.35 },
}

export function detectCurrency(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    // Default to USD as primary market
    if (timezone.includes('America')) return 'USD'
    // UK/Europe
    if (timezone.includes('London') || timezone.includes('Europe/London')) return 'GBP'
    if (timezone.includes('Europe') && !timezone.includes('London')) return 'EUR'
    if (timezone.includes('Africa/Lagos')) return 'NGN'
    if (timezone.includes('Africa/Johannesburg')) return 'ZAR'
    if (timezone.includes('Asia/Tokyo')) return 'JPY'
    if (timezone.includes('Asia/Kolkata')) return 'INR'
    if (timezone.includes('Sao_Paulo')) return 'BRL'
    if (timezone.includes('Australia')) return 'AUD'
    if (timezone.includes('Toronto')) return 'CAD'
  } catch {}
  // Default to USD for all others
  return 'USD'
}

export function convertPrice(usdPrice: number, targetCurrency?: string): string {
  const currency = targetCurrency || (typeof window !== 'undefined' ? detectCurrency() : 'USD')
  const config = currencies[currency] || currencies.USD
  const convertedAmount = usdPrice * config.rate
  // Format appropriately: no decimals for JPY/NGN
  if (currency === 'JPY' || currency === 'NGN') {
    return `${config.symbol}${Math.round(convertedAmount).toLocaleString()}`
  }
  return `${config.symbol}${convertedAmount.toFixed(2)}`
}

export function getCurrencyName(code?: string): string {
  return (code || (typeof window !== 'undefined' ? detectCurrency() : 'USD'))
}

export function formatPriceWithNote(usdPrice: number, targetCurrency?: string) {
  const code = targetCurrency || (typeof window !== 'undefined' ? detectCurrency() : 'USD')
  return {
    display: convertPrice(usdPrice, code),
    code,
  }
}