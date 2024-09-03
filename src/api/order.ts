import axios from 'axios'
import { URL } from 'constants/index'
import { handleAxiosError } from 'helpers'
import { IOrderUpdate, ICreateOrder, IOrder } from 'interfaces'

export const postStripePayment = async (
  paymentData: ICreateOrder['orderToStripe'],
): Promise<{ clientSecret: string }> => {
  try {
    const stripeResponse: { data: { clientSecret: string } } = await axios.post(
      URL.stripePaymentIntent,
      paymentData,
    )

    return stripeResponse.data
  } catch (error) {
    throw handleAxiosError(error, 'Error creating payment intent')
  }
}

export const postOrder = async (
  orderData: ICreateOrder['orderToServer'],
): Promise<void> => {
  try {
    await axios.post(URL.orders, orderData)
  } catch (error) {
    throw handleAxiosError(error, 'Error creating order')
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: IOrderUpdate): Promise<void> => {
  try {
    const orderResponse: { data: IOrder[] } = await axios.get(
      `${URL.orders}?paymentId=${paymentId}`,
    )
    const orderData = orderResponse.data

    await axios.put(`${URL.orders}/${orderData[0].id}`, {
      ...orderData[0],
      ...fields,
      orderUpdatedAt: new Date(),
    })
  } catch (error) {
    throw handleAxiosError(error, 'Error updating order')
  }
}
