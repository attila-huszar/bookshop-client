import { PaymentIntent } from '@stripe/stripe-js'
import { updateOrder } from '@/api'
import { OrderStatus, type Cart, type PostPaymentIntent } from '@/types'

export const getPaymentId = (clientSecret: string): string => {
  return clientSecret.split('_secret_')[0]
}

export const calculateTotalAmount = (cartItems: Cart[]): number => {
  return cartItems.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )
}

export const createStripeIntent = (amount: number): PostPaymentIntent => {
  return {
    amount: Math.round(amount * 100),
    description: 'Book Shop Order',
  }
}

export const updateOrderStatus = async (
  paymentIntent: PaymentIntent,
  orderStatus: OrderStatus,
) => {
  const {
    id: paymentId,
    status: paymentStatus,
    receipt_email,
    shipping,
  } = paymentIntent

  const fullName = shipping?.name?.trim() ?? ''
  const [firstName, ...rest] = fullName.split(/\s+/)
  const lastName = rest.join(' ')

  await updateOrder({
    paymentId,
    fields: {
      paymentIntentStatus: paymentStatus,
      orderStatus,
      firstName,
      lastName,
      email: receipt_email,
      phone: shipping?.phone,
      address: shipping?.address,
    },
  })
}
