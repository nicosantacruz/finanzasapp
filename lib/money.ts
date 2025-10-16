/**
 * Utilidades para manejo de dinero
 *
 * Importante: Todos los valores monetarios se almacenan como enteros (centavos)
 * para evitar problemas de precisión con números de punto flotante.
 *
 * Ejemplo:
 * - $100.50 USD se almacena como 10050 centavos
 * - $1.000.000 CLP se almacena como 100000000 centavos
 */

export type Currency = 'CLP' | 'USD' | 'AED' | 'EUR'

interface CurrencyConfig {
  symbol: string
  code: string
  decimals: number
  locale: string
}

const CURRENCY_CONFIG: Record<Currency, CurrencyConfig> = {
  CLP: {
    symbol: '$',
    code: 'CLP',
    decimals: 0, // El peso chileno no usa decimales en la práctica
    locale: 'es-CL',
  },
  USD: {
    symbol: '$',
    code: 'USD',
    decimals: 2,
    locale: 'en-US',
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    decimals: 2,
    locale: 'de-DE',
  },
  AED: {
    symbol: 'د.إ',
    code: 'AED',
    decimals: 2,
    locale: 'ar-AE',
  },
}

/**
 * Convierte un monto en centavos a formato de visualización
 * @param amountInCents - Monto en centavos (entero)
 * @param currency - Código de moneda
 * @returns String formateado con símbolo de moneda
 *
 * @example
 * formatMoney(10050, "USD") // "$100.50"
 * formatMoney(100000000, "CLP") // "$1.000.000"
 */
export function formatMoney(
  amountInCents: number,
  currency: Currency = 'CLP'
): string {
  const config = CURRENCY_CONFIG[currency]
  const amount = amountInCents / 100

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount)
}

/**
 * Convierte un monto en formato decimal a centavos
 * @param amount - Monto en formato decimal (ej: 100.50)
 * @returns Monto en centavos (entero)
 *
 * @example
 * toCents(100.50) // 10050
 * toCents(1000000) // 100000000
 */
export function toCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convierte un monto en centavos a formato decimal
 * @param amountInCents - Monto en centavos (entero)
 * @returns Monto en formato decimal
 *
 * @example
 * fromCents(10050) // 100.50
 * fromCents(100000000) // 1000000
 */
export function fromCents(amountInCents: number): number {
  return amountInCents / 100
}

/**
 * Parsea un string de input del usuario a centavos
 * @param input - String con el monto (ej: "100.50" o "100,50")
 * @returns Monto en centavos o null si es inválido
 *
 * @example
 * parseMoneyInput("100.50") // 10050
 * parseMoneyInput("100,50") // 10050
 * parseMoneyInput("abc") // null
 */
export function parseMoneyInput(input: string): number | null {
  // Reemplazar coma por punto para normalizar
  const normalized = input.replace(',', '.')

  // Validar que sea un número válido
  const parsed = parseFloat(normalized)
  if (isNaN(parsed)) {
    return null
  }

  return toCents(parsed)
}

/**
 * Suma varios montos en centavos
 * @param amounts - Array de montos en centavos
 * @returns Suma total en centavos
 *
 * @example
 * sumMoney([10050, 20100, 5025]) // 35175
 */
export function sumMoney(...amounts: number[]): number {
  return amounts.reduce((sum, amount) => sum + amount, 0)
}

/**
 * Resta dos montos en centavos
 * @param a - Monto en centavos
 * @param b - Monto a restar en centavos
 * @returns Diferencia en centavos
 *
 * @example
 * subtractMoney(10050, 2025) // 8025
 */
export function subtractMoney(a: number, b: number): number {
  return a - b
}

/**
 * Multiplica un monto por un factor
 * @param amount - Monto en centavos
 * @param factor - Factor multiplicador
 * @returns Resultado en centavos
 *
 * @example
 * multiplyMoney(10050, 1.5) // 15075
 */
export function multiplyMoney(amount: number, factor: number): number {
  return Math.round(amount * factor)
}

/**
 * Divide un monto por un divisor
 * @param amount - Monto en centavos
 * @param divisor - Divisor
 * @returns Resultado en centavos
 *
 * @example
 * divideMoney(10050, 2) // 5025
 */
export function divideMoney(amount: number, divisor: number): number {
  if (divisor === 0) {
    throw new Error('Cannot divide by zero')
  }
  return Math.round(amount / divisor)
}

/**
 * Calcula el porcentaje de un monto
 * @param amount - Monto en centavos
 * @param percentage - Porcentaje (ej: 15 para 15%)
 * @returns Resultado en centavos
 *
 * @example
 * calculatePercentage(10000, 15) // 1500 (15% de 100.00)
 */
export function calculatePercentage(
  amount: number,
  percentage: number
): number {
  return Math.round((amount * percentage) / 100)
}

/**
 * Aplica un porcentaje de descuento a un monto
 * @param amount - Monto en centavos
 * @param discountPercentage - Porcentaje de descuento
 * @returns Monto con descuento aplicado en centavos
 *
 * @example
 * applyDiscount(10000, 15) // 8500 (100.00 - 15% = 85.00)
 */
export function applyDiscount(
  amount: number,
  discountPercentage: number
): number {
  const discount = calculatePercentage(amount, discountPercentage)
  return amount - discount
}

/**
 * Aplica impuestos a un monto
 * @param amount - Monto en centavos
 * @param taxPercentage - Porcentaje de impuesto (ej: 19 para IVA en Chile)
 * @returns Monto con impuestos incluidos en centavos
 *
 * @example
 * applyTax(10000, 19) // 11900 (100.00 + 19% IVA = 119.00)
 */
export function applyTax(amount: number, taxPercentage: number): number {
  const tax = calculatePercentage(amount, taxPercentage)
  return amount + tax
}

/**
 * Formatea un cambio porcentual con signo y color
 * @param change - Porcentaje de cambio
 * @returns Objeto con el string formateado y la clase de color
 *
 * @example
 * formatPercentageChange(15.5) // { text: "+15.5%", color: "text-green-600" }
 * formatPercentageChange(-10.2) // { text: "-10.2%", color: "text-red-600" }
 */
export function formatPercentageChange(change: number): {
  text: string
  color: string
} {
  const sign = change >= 0 ? '+' : ''
  const color = change >= 0 ? 'text-emerald-600' : 'text-rose-600'
  return {
    text: `${sign}${change.toFixed(1)}%`,
    color,
  }
}

/**
 * Convierte entre monedas (requiere tasa de cambio)
 * @param amount - Monto en centavos
 * @param exchangeRate - Tasa de cambio
 * @returns Monto convertido en centavos
 *
 * @example
 * convertCurrency(10000, 800) // 8000000 (100 USD a CLP con tasa 800)
 */
export function convertCurrency(amount: number, exchangeRate: number): number {
  return Math.round(amount * exchangeRate)
}

/**
 * Valida que un monto sea válido (no negativo, no infinito, no NaN)
 * @param amount - Monto a validar
 * @returns true si es válido
 */
export function isValidAmount(amount: number): boolean {
  return (
    typeof amount === 'number' &&
    !isNaN(amount) &&
    isFinite(amount) &&
    amount >= 0
  )
}
