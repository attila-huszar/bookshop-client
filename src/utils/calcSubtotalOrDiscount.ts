import { IBook } from '../interfaces'

export function calcSubtotalOrDiscount(
  data: IBook[],
  quantity: number,
  type: 'subtotal' | 'discount',
) {
  return Number(
    data
      .reduce((acc, item) => {
        const discountAmount = (Number(item.price) * item.discount) / 100
        const totalDiscount = quantity * discountAmount

        return (
          acc +
          (type === 'subtotal' ? Number(item.price) * quantity : totalDiscount)
        )
      }, 0)
      .toFixed(2),
  )
}
