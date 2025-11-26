import { baseRequest, PATH } from './'
import { defaultCurrency } from '@/constants'
import type {
  Order,
  OrderUpdate,
  OrderCreateRequest,
  GetPaymentIntent,
  PostPaymentIntent,
} from '@/types'

export const postPaymentIntent = async ({
  amount,
  description,
}: PostPaymentIntent): Promise<{ clientSecret: string }> => {
  const response = await baseRequest.post<{ clientSecret: string }>(
    PATH.orders.paymentIntent,
    { json: { amount, currency: defaultCurrency, description } },
  )
  return await response.json()
}

export const getPaymentIntent = async (
  paymentId: string,
): Promise<GetPaymentIntent> => {
  const response = await baseRequest.get<GetPaymentIntent>(
    `${PATH.orders.paymentIntent}/${paymentId}`,
  )
  return await response.json()
}

export const deletePaymentIntent = async (
  paymentId: string,
): Promise<GetPaymentIntent> => {
  const response = await baseRequest.delete<GetPaymentIntent>(
    `${PATH.orders.paymentIntent}/${paymentId}`,
  )
  return await response.json()
}

export const postCreateOrderWithPayment = async (
  orderRequest: OrderCreateRequest,
): Promise<{ clientSecret: string; amount: number }> => {
  const response = await baseRequest.post<{
    clientSecret: string
    amount: number
  }>(PATH.orders.createWithPayment, { json: orderRequest })
  return await response.json()
}

export const updateOrder = async ({
  paymentId,
  fields,
}: OrderUpdate): Promise<Order> => {
  const response = await baseRequest.patch<Order>(PATH.orders.update, {
    json: { paymentId, fields },
  })
  return await response.json()
}
