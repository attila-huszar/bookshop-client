export const formatAmount = (amount: number, language = 'en'): string =>
  amount.toLocaleString(language, {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
    useGrouping: false,
  })

/** Convert a decimal amount to cents without binary rounding at decimal ties. */
export function toCents(amount: number): number {
  const [coefficient, exponent = '0'] = amount.toString().split('e')

  return Math.round(Number(`${coefficient}e${Number(exponent) + 2}`))
}

/** Round the discounted unit price before multiplying by quantity. */
export function calculatePriceCents(
  price: number,
  discount = 0,
  quantity = 1,
): number {
  const unitCents = Math.round((toCents(price) * (100 - discount)) / 100)

  return unitCents * quantity
}
