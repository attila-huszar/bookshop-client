import { baseRequest, PATH } from './'
import type { Order, OrderCreate, PaymentIntentResponse } from '@/types'

export const getPaymentIntent = async (
  paymentId: string,
): Promise<PaymentIntentResponse> => {
  const response = await baseRequest.get<PaymentIntentResponse>(
    `${PATH.orders.paymentIntents}/${paymentId}`,
  )
  return await response.json()
}

export const deletePaymentIntent = async (
  paymentId: string,
): Promise<PaymentIntentResponse> => {
  const response = await baseRequest.delete<PaymentIntentResponse>(
    `${PATH.orders.paymentIntents}/${paymentId}`,
  )
  return await response.json()
}

export const getOrder = async (paymentId: string): Promise<Order> => {
  const response = await baseRequest.get<Order>(
    `${PATH.orders.base}/${paymentId}`,
  )
  return await response.json()
}

export const postOrder = async (
  order: OrderCreate,
): Promise<{ paymentSession: string; amount: number }> => {
  const response = await baseRequest.post<{
    paymentSession: string
    amount: number
  }>(PATH.orders.base, { json: order })
  return await response.json()
}
