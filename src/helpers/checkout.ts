import { type Cart } from '@/types'

export const getPaymentId = (paymentSession: string | undefined): string =>
  paymentSession?.split('_secret_')[0] ?? ''

export const calculateTotalAmount = (cartItems: Cart[]): number =>
  cartItems.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )
