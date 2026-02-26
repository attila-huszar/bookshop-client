import { authRequest, PATH } from '.'
import { ORDER_SYNC_RETRY_STATUS_CODES } from '@/constants'
import type {
  OrderSyncResponse,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentSession,
} from '@/types'

export const getPaymentIntent = async (
  paymentId: string,
): Promise<PaymentIntentResponse> => {
  const response = await authRequest.get<PaymentIntentResponse>(
    `${PATH.payments}/${paymentId}`,
  )
  return await response.json()
}

export const postPaymentIntent = async (
  payment: PaymentIntentRequest,
): Promise<PaymentSession> => {
  const response = await authRequest.post<PaymentSession>(PATH.payments, {
    json: payment,
  })
  return await response.json()
}

export const deletePaymentIntent = async (
  paymentId: string,
): Promise<PaymentIntentResponse> => {
  const response = await authRequest.delete<PaymentIntentResponse>(
    `${PATH.payments}/${paymentId}`,
  )
  return await response.json()
}

export const getOrderSyncStatus = async (
  paymentId: string,
): Promise<{ status: number; data: OrderSyncResponse }> => {
  const response = await authRequest.get<OrderSyncResponse>(
    `${PATH.payments}/${paymentId}/order-sync`,
    {
      retry: {
        limit: 3,
        statusCodes: ORDER_SYNC_RETRY_STATUS_CODES,
        retryOnTimeout: true,
      },
    },
  )
  const data = await response.json()
  return { status: response.status, data }
}
