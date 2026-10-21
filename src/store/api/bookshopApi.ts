import { i18n } from '@/i18n'
import type { BaseQueryApi } from '@reduxjs/toolkit/query'
import {
  createApi,
  type TypedUseQueryStateOptions,
  type TypedUseQueryStateResult,
  type TypedUseQuerySubscriptionOptions,
} from '@reduxjs/toolkit/query/react'
import { HTTPError, type Options } from 'ky'
import { authRequest } from '@/api/authRequest'
import { baseRequest } from '@/api/baseRequest'
import { PATH } from '@/api/path'
import { getApiError, getErrorMessage } from '@/helpers/errors'
import type {
  AcceptPaymentTermsRequest,
  Author,
  AuthorCreate,
  AuthorReference,
  AuthorUpdate,
  Book,
  BookCreate,
  BookUpdate,
  BookWithAuthorId,
  CmsOrder,
  CmsOrderUpdate,
  CmsUser,
  CmsUserCreate,
  CmsUserUpdate,
  CountryData,
  EmailOutboxQuery,
  EmailOutboxResponse,
  Filters,
  News,
  Order,
  PaymentTermsReview,
  PublishTermsRequest,
  RegisterRequest,
  RegisterResponse,
  TermsAcceptance,
  TermsDocument,
  User,
  UserProfileUpdate,
} from '@/types'
import { HttpErrorCode } from '@/types/ApiError'
import { type BooksQueryArgs, booksSearchParams } from './booksQuery'
import { cacheTimes } from './cacheTimes'

type QueryArgs = Options & {
  url: string
  /** Use token/refresh handling, including cookie-based guest checkout. */
  withAuth?: boolean
}

/** Adapt Ky results and retain structured error codes for display-time translation. */
const baseQuery = async (args: QueryArgs, { signal }: BaseQueryApi) => {
  const { url, withAuth = false, ...options } = args

  try {
    const client = withAuth ? authRequest : baseRequest
    const response = await client(url, { ...options, signal })
    const data = response.status === 204 ? null : await response.json<unknown>()

    return { data, meta: { response } }
  } catch (error: unknown) {
    return {
      error: {
        ...(getApiError(error) ?? { code: HttpErrorCode.UnknownResponse }),
        message: getErrorMessage(error, i18n.t('common.requestFailed')),
        ...(error instanceof HTTPError
          ? { status: error.response.status }
          : {}),
      },
    }
  }
}

type SearchOptions = Pick<Filters, 'genre' | 'price' | 'publishYear'>

/** One server-data cache. Ky still owns cookies and single-flight token refresh. */
export const bookshopApi = createApi({
  reducerPath: 'bookshopApi',
  baseQuery,
  tagTypes: [
    'Book',
    'Author',
    'News',
    'Order',
    'User',
    'Profile',
    'CheckoutTerms',
    'TermsDocument',
  ],
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: (build) => ({
    termsDocument: build.query<TermsDocument | null, string | undefined>({
      query: (version) => ({
        url: version ? `${PATH.terms}/${version}` : PATH.terms,
      }),
      providesTags: (_result, _error, version) =>
        version ? [] : ['TermsDocument'],
    }),
    cmsTerms: build.query<TermsDocument | null, void>({
      query: () => ({ url: PATH.cms.terms, withAuth: true }),
      providesTags: ['TermsDocument'],
    }),
    publishTerms: build.mutation<TermsDocument, PublishTermsRequest>({
      query: (request) => ({
        url: PATH.cms.terms,
        method: 'post',
        json: request,
        withAuth: true,
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : ['TermsDocument', 'CheckoutTerms'],
    }),
    paymentTerms: build.query<PaymentTermsReview, string>({
      query: (paymentId) => ({
        url: `${PATH.payments}/${paymentId}/terms`,
        withAuth: true,
        credentials: 'include',
      }),
      keepUnusedDataFor: 0,
      providesTags: ['CheckoutTerms'],
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
    books: build.query<{ books: Book[]; total: number }, BooksQueryArgs>({
      query: (arg) => ({
        url: PATH.books,
        searchParams: booksSearchParams(arg),
      }),
      transformResponse: (books: Book[], meta) => ({
        books,
        total: Number(meta?.response.headers.get('x-total-count') ?? 0),
      }),
      keepUnusedDataFor: cacheTimes.catalogue,
      providesTags: ['Book'],
    }),
    book: build.query<Book, number>({
      query: (id) => ({ url: PATH.books, searchParams: { id } }),
      keepUnusedDataFor: cacheTimes.catalogue,
      providesTags: ['Book'],
    }),
    booksByAuthor: build.query<Book[], number>({
      query: (authorId) => ({ url: PATH.books, searchParams: { authorId } }),
      keepUnusedDataFor: cacheTimes.catalogue,
      providesTags: ['Book'],
    }),
    bookSearch: build.query<Book[], string>({
      query: (title) => ({ url: PATH.books, searchParams: { title } }),
      providesTags: ['Book'],
    }),
    booksByProperty: build.query<
      Book[],
      'newRelease' | 'topSellers' | 'recommended'
    >({
      query: (property) =>
        property === 'recommended'
          ? { url: `${PATH.books}/recommended` }
          : { url: PATH.books, searchParams: { [property]: true } },
      keepUnusedDataFor: cacheTimes.featured,
      providesTags: ['Book'],
    }),
    searchOptions: build.query<SearchOptions, void>({
      query: () => ({ url: PATH.searchOptions }),
      keepUnusedDataFor: cacheTimes.reference,
      providesTags: ['Book'],
    }),
    author: build.query<AuthorReference, number>({
      query: (id) => ({ url: `${PATH.authors}/${id}` }),
      keepUnusedDataFor: cacheTimes.reference,
      providesTags: ['Author'],
    }),
    authorSearch: build.query<AuthorReference[], string>({
      query: (name) => ({ url: PATH.authors, searchParams: { name } }),
      providesTags: ['Author'],
    }),
    news: build.query<News[], void>({
      query: () => ({ url: PATH.news }),
      keepUnusedDataFor: cacheTimes.featured,
      providesTags: ['News'],
    }),
    countryCodes: build.query<CountryData, void>({
      query: () => ({ url: PATH.users.countryCodes }),
      keepUnusedDataFor: cacheTimes.countryCodes,
    }),
    userOrders: build.query<Order[], void>({
      query: () => ({ url: PATH.orders, withAuth: true }),
      providesTags: ['Order'],
    }),
    userProfile: build.query<User, void>({
      query: () => ({ url: PATH.users.profile, withAuth: true }),
      providesTags: ['Profile'],
    }),
    register: build.mutation<RegisterResponse, RegisterRequest>({
      query: (user) => {
        const body = new FormData()
        body.append('firstName', user.firstName)
        body.append('lastName', user.lastName)
        body.append('email', user.email)
        body.append('password', user.password)
        body.append('country', user.country)

        if (user.avatar instanceof File) {
          body.append('avatar', user.avatar)
        }

        return { url: PATH.users.register, method: 'post', body }
      },
    }),
    updateUserProfile: build.mutation<User, UserProfileUpdate>({
      query: (json) => ({
        url: PATH.users.profile,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    updateAvatar: build.mutation<User, FormData>({
      query: (body) => ({
        url: PATH.users.avatar,
        method: 'post',
        body,
        withAuth: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    cmsBooks: build.query<BookWithAuthorId[], void>({
      query: () => ({ url: PATH.cms.books, withAuth: true }),
      providesTags: ['Book'],
    }),
    cmsAuthors: build.query<Author[], void>({
      query: () => ({ url: PATH.cms.authors, withAuth: true }),
      providesTags: ['Author'],
    }),
    cmsOrders: build.query<CmsOrder[], void>({
      query: () => ({ url: PATH.cms.orders, withAuth: true }),
      providesTags: ['Order'],
    }),
    cmsUsers: build.query<CmsUser[], void>({
      query: () => ({ url: PATH.cms.users, withAuth: true }),
      providesTags: ['User'],
    }),
    cmsEmailOutbox: build.query<EmailOutboxResponse, EmailOutboxQuery>({
      query: (criteria) => ({
        url: PATH.cms.emailOutbox,
        searchParams: criteria,
        withAuth: true,
      }),
      keepUnusedDataFor: 0,
    }),
    addBook: build.mutation<BookWithAuthorId, BookCreate>({
      query: (json) => ({
        url: PATH.cms.books,
        method: 'post',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Book'],
    }),
    updateBook: build.mutation<BookWithAuthorId, BookUpdate>({
      query: (json) => ({
        url: PATH.cms.books,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Book'],
    }),
    hardDeleteBooks: build.mutation<BookWithAuthorId['id'][], number[]>({
      query: (bookIds) => ({
        url: PATH.cms.books,
        method: 'delete',
        json: { bookIds },
        withAuth: true,
      }),
      invalidatesTags: ['Book'],
    }),
    addAuthor: build.mutation<Author, AuthorCreate>({
      query: (json) => ({
        url: PATH.cms.authors,
        method: 'post',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
    updateAuthor: build.mutation<Author, AuthorUpdate>({
      query: (json) => ({
        url: PATH.cms.authors,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
    hardDeleteAuthors: build.mutation<Author['id'][], number[]>({
      query: (authorIds) => ({
        url: PATH.cms.authors,
        method: 'delete',
        json: { authorIds },
        withAuth: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
    addUser: build.mutation<CmsUser, CmsUserCreate>({
      query: (json) => ({
        url: PATH.cms.users,
        method: 'post',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    updateUser: build.mutation<CmsUser, CmsUserUpdate>({
      query: (json) => ({
        url: PATH.cms.users,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    softDeleteUsers: build.mutation<number, number[]>({
      query: (userIds) => ({
        url: PATH.cms.users,
        method: 'delete',
        json: { userIds },
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    restoreUsers: build.mutation<number, number[]>({
      query: (userIds) => ({
        url: PATH.cms.restore.users,
        method: 'patch',
        json: { userIds },
        withAuth: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    updateOrder: build.mutation<CmsOrder, CmsOrderUpdate>({
      query: (json) => ({
        url: PATH.cms.orders,
        method: 'patch',
        json,
        withAuth: true,
      }),
      invalidatesTags: ['Order'],
    }),
    softDeleteOrders: build.mutation<number, number[]>({
      query: (orderIds) => ({
        url: PATH.cms.orders,
        method: 'delete',
        json: { orderIds },
        withAuth: true,
      }),
      invalidatesTags: ['Order'],
    }),
    restoreOrders: build.mutation<number, number[]>({
      query: (orderIds) => ({
        url: PATH.cms.restore.orders,
        method: 'patch',
        json: { orderIds },
        withAuth: true,
      }),
      invalidatesTags: ['Order'],
    }),
  }),
})

export const {
  useTermsDocumentQuery,
  useCmsTermsQuery,
  usePublishTermsMutation,
  usePaymentTermsQuery,
  useAcceptPaymentTermsMutation,
  useBooksQuery,
  useBookQuery,
  useBooksByPropertyQuery,
  useAuthorQuery,
  useCmsEmailOutboxQuery,
  useRegisterMutation,
  useUpdateUserProfileMutation,
  useUpdateAvatarMutation,
  useAddBookMutation,
  useUpdateBookMutation,
  useAddAuthorMutation,
  useUpdateAuthorMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useUpdateOrderMutation,
  useHardDeleteBooksMutation,
  useHardDeleteAuthorsMutation,
  useSoftDeleteOrdersMutation,
  useRestoreOrdersMutation,
  useSoftDeleteUsersMutation,
  useRestoreUsersMutation,
} = bookshopApi

type QueryState<Result> = TypedUseQueryStateResult<
  Result,
  void,
  typeof baseQuery
>

type QueryOptions<
  Result,
  Selected extends Record<string, unknown>,
> = TypedUseQuerySubscriptionOptions &
  TypedUseQueryStateOptions<Result, void, typeof baseQuery, Selected>

/**
 * Subscribes to catalogue filter options without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 *
 * @example
 * useSearchOptionsQuery({ refetchOnMountOrArgChange: cacheTimes.reference })
 */
export function useSearchOptionsQuery<
  Selected extends Record<string, unknown> = QueryState<SearchOptions>,
>(options?: QueryOptions<SearchOptions, Selected>) {
  return bookshopApi.useSearchOptionsQuery(undefined, options)
}

/**
 * Subscribes to news articles without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useNewsQuery<
  Selected extends Record<string, unknown> = QueryState<News[]>,
>(options?: QueryOptions<News[], Selected>) {
  return bookshopApi.useNewsQuery(undefined, options)
}

/**
 * Subscribes to the country-code-to-name mapping without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useCountryCodesQuery<
  Selected extends Record<string, unknown> = QueryState<CountryData>,
>(options?: QueryOptions<CountryData, Selected>) {
  return bookshopApi.useCountryCodesQuery(undefined, options)
}

/**
 * Subscribes to the signed-in user's orders without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useUserOrdersQuery<
  Selected extends Record<string, unknown> = QueryState<Order[]>,
>(options?: QueryOptions<Order[], Selected>) {
  return bookshopApi.useUserOrdersQuery(undefined, options)
}

/**
 * Subscribes to the signed-in user's profile without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 *
 * @example
 * useUserProfileQuery({ skip: !accessToken })
 */
export function useUserProfileQuery<
  Selected extends Record<string, unknown> = QueryState<User>,
>(options?: QueryOptions<User, Selected>) {
  return bookshopApi.useUserProfileQuery(undefined, options)
}

/**
 * Subscribes to the admin book list without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useCmsBooksQuery<
  Selected extends Record<string, unknown> = QueryState<BookWithAuthorId[]>,
>(options?: QueryOptions<BookWithAuthorId[], Selected>) {
  return bookshopApi.useCmsBooksQuery(undefined, options)
}

/**
 * Subscribes to the admin author list without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useCmsAuthorsQuery<
  Selected extends Record<string, unknown> = QueryState<Author[]>,
>(options?: QueryOptions<Author[], Selected>) {
  return bookshopApi.useCmsAuthorsQuery(undefined, options)
}

/**
 * Subscribes to the admin order list without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useCmsOrdersQuery<
  Selected extends Record<string, unknown> = QueryState<CmsOrder[]>,
>(options?: QueryOptions<CmsOrder[], Selected>) {
  return bookshopApi.useCmsOrdersQuery(undefined, options)
}

/**
 * Subscribes to the admin user list without a query argument.
 *
 * @param options - Optional RTK Query settings for skipping, refetching, and selecting results.
 * @returns Query state or `selectFromResult` output, together with `refetch`.
 */
export function useCmsUsersQuery<
  Selected extends Record<string, unknown> = QueryState<CmsUser[]>,
>(options?: QueryOptions<CmsUser[], Selected>) {
  return bookshopApi.useCmsUsersQuery(undefined, options)
}
