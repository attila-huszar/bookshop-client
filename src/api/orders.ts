import { authRequest } from './'
import { PATH } from '@/constants'
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
  return authRequest
    .post(PATH.SERVER.orders.paymentIntent, {
      json: { amount, currency, description },
    })
    .json()
}

export const getPaymentIntent = async (
  paymentId: string,
): Promise<GetPaymentIntent> => {
  return authRequest
    .get(`${PATH.SERVER.orders.paymentIntent}/${paymentId}`)
    .json()
}

export const postCreateOrder = async (
  orderData: Order,
): Promise<{ paymentId: string }> => {
  return authRequest
    .post(PATH.SERVER.orders.create, {
      json: orderData,
    })
    .json()
}

export const updateOrder = async ({
  paymentId,
  fields,
}: OrderUpdate): Promise<Order> => {
  return authRequest
    .post(PATH.SERVER.orders.update, {
      json: { paymentId, fields },
    })
    .json()
}
