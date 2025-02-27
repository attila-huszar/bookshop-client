import axios from 'axios'
import { jsonServerPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IOrderUpdate, ICreateOrder, IOrder } from '@/interfaces'

export const postOrder = async (
  orderData: ICreateOrder['orderToServer'],
): Promise<void> => {
  try {
    await axios.post(`${jsonServerPath}/${PATH.orders}`, orderData)
  } catch (error) {
    throw handleErrors(error, 'Error creating order')
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: IOrderUpdate): Promise<void> => {
  try {
    const orderResponse: { data: IOrder[] } = await axios.get(
      `${jsonServerPath}/${PATH.orders}?paymentId=${paymentId}`,
    )
    const orderData = orderResponse.data

    await axios.put(`${jsonServerPath}/${PATH.orders}/${orderData[0].id}`, {
      ...orderData[0],
      ...fields,
      orderUpdatedAt: new Date(),
    })
  } catch (error) {
    throw handleErrors(error, 'Error updating order')
  }
}
