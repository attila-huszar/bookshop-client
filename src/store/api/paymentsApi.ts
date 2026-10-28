import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/cacheTimes'
import type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentIntentStatus,
  PaymentSession,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export type PaymentDetails = PaymentSession & { status: PaymentIntentStatus }

export const paymentsApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    payment: build.query<PaymentDetails, string>({
      query: (paymentId) => ({
        url: `${PATH.payments}/${paymentId}`,
        withAuth: true,
        credentials: 'include',
      }),
      transformResponse: (payment: PaymentIntentResponse) => ({
        paymentId: payment.id,
        paymentToken: payment.client_secret ?? '',
        amount: payment.amount,
        status: payment.status,
      }),
      keepUnusedDataFor: CacheTime.None,
    }),

    createPayment: build.mutation<
      PaymentSession,
      {
        payment: PaymentIntentRequest
        clientIdempotencyKey: string
      }
    >({
      query: (request) => ({
        url: PATH.payments,
        method: 'post',
        withAuth: true,
        credentials: 'include',
        headers: { 'Idempotency-Key': request.clientIdempotencyKey },
        json: request.payment,
      }),
    }),

    cancelPayment: build.mutation<void, string>({
      query: (paymentId) => ({
        url: `${PATH.payments}/${paymentId}`,
        method: 'delete',
        withAuth: true,
        credentials: 'include',
      }),
      transformResponse: () => undefined,
    }),
  }),
})
