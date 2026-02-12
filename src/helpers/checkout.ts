import { Cart } from '@/types'

export const getPaymentId = (session: string | undefined): string =>
  session?.split('_secret_')[0] ?? ''

export const calculateTotalAmount = (cartItems: Cart[]): number =>
  cartItems.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )
