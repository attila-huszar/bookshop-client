import { authRequest, baseRequest, PATH } from './'
import type {
  Order,
  OrderUpdate,
  GetPaymentIntent,
  PostPaymentIntent,
} from '@/types'

export const postPaymentIntent = async ({
  amount,
  currency,
  description,
}: PostPaymentIntent): Promise<{ clientSecret: string }> => {
  const response = await baseRequest.post<{ clientSecret: string }>(
    PATH.orders.paymentIntent,
    { json: { amount, currency, description } },
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

export const postCreateOrder = async (
  orderData: Order,
): Promise<{ paymentId: string }> => {
  const response = await baseRequest.post<{ paymentId: string }>(
    PATH.orders.create,
    { json: orderData },
  )
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

export const getAllOrders = async (): Promise<Order[]> => {
  const response = await authRequest.get<Order[]>(PATH.cms.orders.all)
  return await response.json()
}
