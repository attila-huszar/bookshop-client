import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/cacheTimes'
import type {
  AcceptPaymentTermsRequest,
  PaymentTermsReview,
  PublishTermsRequest,
  TermsAcceptance,
  TermsDocument,
  TermsDocumentSummary,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export const termsApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    termsDocument: build.query<TermsDocument | null, string | undefined>({
      query: (version) => ({
        url: version ? `${PATH.terms}/${version}` : PATH.terms,
      }),
      providesTags: (_result, _error, version) => [
        { type: 'TermsDocument', id: version ?? 'Current' },
      ],
    }),

    cmsTerms: build.query<TermsDocument | null, void>({
      query: () => ({ url: PATH.cms.terms, withAuth: true }),
      providesTags: [{ type: 'TermsDocument', id: 'Current' }],
    }),

    cmsTermsHistory: build.query<TermsDocumentSummary[], void>({
      query: () => ({ url: PATH.cms.termsHistory, withAuth: true }),
      providesTags: [{ type: 'TermsDocument', id: 'History' }],
    }),

    paymentTerms: build.query<PaymentTermsReview, string>({
      query: (paymentId) => ({
        url: `${PATH.payments}/${paymentId}/terms`,
        withAuth: true,
        credentials: 'include',
      }),
      keepUnusedDataFor: CacheTime.None,
      providesTags: ['CheckoutTerms'],
    }),

    deleteTermsVersion: build.mutation<null, string>({
      query: (version) => ({
        url: `${PATH.cms.terms}/${version}`,
        method: 'delete',
        withAuth: true,
      }),
      invalidatesTags: (_result, error, version) =>
        error
          ? [{ type: 'TermsDocument', id: 'History' }]
          : [
              { type: 'TermsDocument', id: 'Current' },
              { type: 'TermsDocument', id: 'History' },
              'CheckoutTerms',
              { type: 'TermsDocument', id: version },
            ],
    }),

    publishTerms: build.mutation<TermsDocument, PublishTermsRequest>({
      query: (request) => ({
        url: PATH.cms.terms,
        method: 'post',
        json: request,
        withAuth: true,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              { type: 'TermsDocument', id: 'Current' },
              { type: 'TermsDocument', id: 'History' },
              'CheckoutTerms',
            ],
    }),

    acceptPaymentTerms: build.mutation<
      TermsAcceptance,
      AcceptPaymentTermsRequest
    >({
      query: (request) => ({
        url: `${PATH.payments}/${request.paymentId}/terms`,
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
  }),
})

export const {
  useTermsDocumentQuery,
  useCmsTermsQuery,
  useCmsTermsHistoryQuery,
  useDeleteTermsVersionMutation,
  usePublishTermsMutation,
  usePaymentTermsQuery,
  useAcceptPaymentTermsMutation,
} = termsApi
