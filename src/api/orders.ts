import { authRequest } from './'
import { PATH } from '@/constants'
import {
  IPostPaymentIntent,
  IOrder,
  IOrderUpdate,
  IGetPaymentIntent,
} from '@/interfaces'

export const postPaymentIntent = async ({
  amount,
  currency,
  description,
}: IPostPaymentIntent): Promise<{ clientSecret: string }> => {
  return authRequest
    .post(PATH.SERVER.orders.paymentIntent, {
      json: { amount, currency, description },
    })
    .json()
}

export const getPaymentIntent = async (
  paymentId: string,
): Promise<IGetPaymentIntent> => {
  return authRequest
    .get(`${PATH.SERVER.orders.paymentIntent}/${paymentId}`)
    .json()
}

export const postCreateOrder = async (
  orderData: IOrder,
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
}: IOrderUpdate): Promise<IOrder> => {
  return authRequest
    .post(PATH.SERVER.orders.update, {
      json: { paymentId, fields },
    })
    .json()
}
