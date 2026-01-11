import { Cart } from '@/types'

export function calcSubtotalOrDiscount(
  data: Cart[],
  type: 'subtotal' | 'discount',
) {
  return data.reduce((acc, item) => {
    const discountAmount = (item.price * item.discount) / 100
    const totalDiscount = item.quantity * discountAmount

    return (
      acc + (type === 'subtotal' ? item.price * item.quantity : totalDiscount)
    )
  }, 0)
}
