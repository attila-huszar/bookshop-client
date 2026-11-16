import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/time'
import type {
  AcceptPaymentTermsRequest,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentIntentStatus,
  PaymentSession,
  PaymentTermsReview,
  TermsAcceptance,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export type PaymentDetails = PaymentSession & { status: PaymentIntentStatus }

export const paymentsApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    paymentTerms: build.query<PaymentTermsReview, string>({
      query: (paymentId) => ({
        url: PATH.payments.terms(paymentId),
        withAuth: true,
        credentials: 'include',
      }),
      keepUnusedDataFor: CacheTime.None,
      providesTags: ['CheckoutTerms'],
    }),

    acceptPaymentTerms: build.mutation<
      TermsAcceptance,
      AcceptPaymentTermsRequest
    >({
      query: (request) => ({
        url: PATH.payments.terms(request.paymentId),
        method: 'post',
        withAuth: true,
        credentials: 'include',
        json: {
          accepted: request.accepted,
          version: request.version,
          language: request.language,
        },
      }),
      invalidatesTags: (_result, error) =>
        error?.status === 412 ? ['CheckoutTerms'] : [],
    }),

    payment: build.query<PaymentDetails, string>({
      query: (paymentId) => ({
        url: PATH.payments.byId(paymentId),
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
        url: PATH.payments.root,
        method: 'post',
        withAuth: true,
        credentials: 'include',
        headers: { 'Idempotency-Key': request.clientIdempotencyKey },
        json: request.payment,
      }),
    }),

    cancelPayment: build.mutation<void, string>({
      query: (paymentId) => ({
        url: PATH.payments.byId(paymentId),
        method: 'delete',
        withAuth: true,
        credentials: 'include',
      }),
      transformResponse: () => undefined,
    }),
  }),
})

export const {
  usePaymentTermsQuery,
  useAcceptPaymentTermsMutation,
  useLazyPaymentQuery,
} = paymentsApi
