import type {
  Order,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentSession,
} from '@/types'
import { baseRequest, PATH } from './'

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
  order: PaymentIntentRequest,
): Promise<PaymentSession> => {
  const response = await baseRequest.post<PaymentSession>(PATH.orders.base, {
    json: order,
  })
  return await response.json()
}
