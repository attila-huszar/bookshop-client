import { baseRequest } from './api'
import { PATH } from './path'
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
      PATH.orders.paymentIntent,
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
      `${PATH.orders.paymentIntent}/${paymentId}`,
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
      `${PATH.orders.paymentIntent}/${paymentId}`,
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
      PATH.orders.create,
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
    const response = await baseRequest.patch<Order>(PATH.orders.update, {
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
