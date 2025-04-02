import { baseRequest } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
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
  try {
    const response = await baseRequest.post<{ clientSecret: string }>(
      PATH.SERVER.orders.paymentIntent,
      { json: { amount, currency, description } },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to create payment intent',
    })
    throw formattedError
  }
}

export const getPaymentIntent = async (
  paymentId: string,
): Promise<GetPaymentIntent> => {
  try {
    const response = await baseRequest.get<GetPaymentIntent>(
      `${PATH.SERVER.orders.paymentIntent}/${paymentId}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get payment intent',
    })
    throw formattedError
  }
}

export const deletePaymentIntent = async (
  paymentId: string,
): Promise<GetPaymentIntent> => {
  try {
    const response = await baseRequest.delete<GetPaymentIntent>(
      `${PATH.SERVER.orders.paymentIntent}/${paymentId}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to delete payment intent',
    })
    throw formattedError
  }
}

export const postCreateOrder = async (
  orderData: Order,
): Promise<{ paymentId: string }> => {
  try {
    const response = await baseRequest.post<{ paymentId: string }>(
      PATH.SERVER.orders.create,
      { json: orderData },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to create order',
    })
    throw formattedError
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: OrderUpdate): Promise<Order> => {
  try {
    const response = await baseRequest.patch<Order>(PATH.SERVER.orders.update, {
      json: { paymentId, fields },
    })
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to update order',
    })
    throw formattedError
  }
}
