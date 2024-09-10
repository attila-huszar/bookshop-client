import { ICart } from '@/interfaces'

export function calcSubtotalOrDiscount(
  data: ICart[],
  type: 'subtotal' | 'discount',
) {
  return data.reduce((acc, item) => {
    const discountAmount = (Number(item.price) * item.discount) / 100
    const totalDiscount = item.quantity * discountAmount

    return (
      acc +
      (type === 'subtotal' ? Number(item.price) * item.quantity : totalDiscount)
    )
  }, 0)
}
