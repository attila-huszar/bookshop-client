import { PATH } from '@/api/path'
import type {
  PublishTermsRequest,
  TermsDocument,
  TermsDocumentSummary,
} from '@/types'
import { bookshopApi } from './bookshopApi'

export const termsApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    termsDocument: build.query<TermsDocument | null, string | undefined>({
      query: (version) => ({
        url: version ? PATH.terms.byVersion(version) : PATH.terms.root,
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

    deleteTermsVersion: build.mutation<null, string>({
      query: (version) => ({
        url: PATH.cms.termsByVersion(version),
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
  }),
})

export const {
  useTermsDocumentQuery,
  useCmsTermsQuery,
  useCmsTermsHistoryQuery,
  useDeleteTermsVersionMutation,
  usePublishTermsMutation,
} = termsApi
