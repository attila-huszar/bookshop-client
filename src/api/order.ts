import axios, { AxiosError } from 'axios'
import { URL } from 'constants/index'
import { IOrderUpdate, ICreateOrder } from 'interfaces'

export const postOrder = async (
  orderData: ICreateOrder['orderToServer'],
): Promise<void> => {
  try {
    await axios.post(URL.orders, orderData)
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Error creating order'
  }
}

export const postStripePayment = async (
  paymentData: ICreateOrder['orderToStripe'],
): Promise<{ clientSecret: string }> => {
  try {
    const { data } = await axios.post(URL.stripePaymentIntent, paymentData)

    return data
  } catch (error) {
    throw error instanceof AxiosError
      ? error.message
      : 'Error creating payment intent'
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: IOrderUpdate): Promise<void> => {
  try {
    const orderResponse = await axios.get(
      `${URL.orders}?paymentId=${paymentId}`,
    )
    const orderData = orderResponse.data

    await axios.put(`${URL.orders}/${orderData[0].id}`, {
      ...orderData[0],
      ...fields,
      orderUpdatedAt: new Date(),
    })
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Error updating order'
  }
}
