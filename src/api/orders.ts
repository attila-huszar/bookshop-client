import { authRequest, PATH } from '.'
import type { Order } from '@/types'

export const getUserOrders = async (): Promise<Order[]> => {
  const response = await authRequest.get(PATH.orders)

  if (!response.ok) {
    throw new Error('Failed to fetch orders')
  }

  return await response.json()
}
