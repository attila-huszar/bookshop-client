import { api } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IOrderUpdate, ICreateOrder, IOrder } from '@/interfaces'

export const postOrder = async (
  orderData: ICreateOrder['orderToServer'],
): Promise<void> => {
  try {
  } catch (error) {
    throw handleErrors(error, 'Error creating order')
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: IOrderUpdate): Promise<void> => {
  try {
  } catch (error) {
    throw handleErrors(error, 'Error updating order')
  }
}
