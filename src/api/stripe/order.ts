import axios from 'axios'
import { stripeURL } from '@/constants'
import { handleErrors } from '@/errors'
import { ICreateOrder, IRetrieveOrder } from '@/interfaces'

export const getStripePayment = async (
  paymentId: string,
): Promise<IRetrieveOrder> => {
  try {
    const stripeResponse: { data: IRetrieveOrder } = await axios.get(
      `${stripeURL}/retrieve-payment-intent/${paymentId}`,
    )

    return stripeResponse.data
  } catch (error) {
    throw handleErrors(error, 'Error retrieving payment')
  }
}

export const postStripePayment = async (
  paymentData: ICreateOrder['orderToStripe'],
): Promise<{ clientSecret: string }> => {
  try {
    const stripeResponse: { data: { clientSecret: string } } = await axios.post(
      `${stripeURL}/create-payment-intent`,
      paymentData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    )

    return stripeResponse.data
  } catch (error) {
    throw handleErrors(error, 'Error creating payment')
  }
}

export const getStripePaymentCancel = async (
  paymentId: string,
): Promise<void> => {
  try {
    await axios.get(`${stripeURL}/cancel-payment-intent/${paymentId}`)
  } catch (error) {
    throw handleErrors(error, 'Error canceling payment')
  }
}
