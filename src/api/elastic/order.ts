import axios from 'axios'
import { elasticPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IOrderUpdate, ICreateOrder } from '@/interfaces'

export const postOrder = async (
  orderData: ICreateOrder['orderToServer'],
): Promise<void> => {
  try {
    await axios.put(
      `${elasticPath}/${PATH.orders}/_doc/${orderData.paymentId}`,
      orderData,
    )
  } catch (error) {
    throw handleErrors(error, 'Error creating order')
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: IOrderUpdate): Promise<void> => {
  try {
    await axios.post(`${elasticPath}/${PATH.orders}/_update/${paymentId}`, {
      doc: {
        ...fields,
        orderUpdatedAt: new Date(),
      },
    })
  } catch (error) {
    throw handleErrors(error, 'Error updating order')
  }
}
