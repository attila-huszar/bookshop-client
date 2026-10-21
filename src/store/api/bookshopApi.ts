import {
  createApi,
  type TypedUseQueryStateOptions,
  type TypedUseQueryStateResult,
  type TypedUseQuerySubscriptionOptions,
} from '@reduxjs/toolkit/query/react'
import { PATH } from '@/api/path'
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
import { type BooksQueryArgs, booksSearchParams } from './booksQuery'
import { cacheTimes } from './cacheTimes'
import { kyBaseQuery } from './kyBaseQuery'

type SearchOptions = Pick<Filters, 'genre' | 'price' | 'publishYear'>

/** One server-data cache. Ky still owns cookies and single-flight token refresh. */
export const bookshopApi = createApi({
  reducerPath: 'bookshopApi',
  baseQuery: kyBaseQuery,
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
      query: () => ({ url: PATH.cms.terms, authenticated: true }),
      providesTags: ['TermsDocument'],
    }),
    publishTerms: build.mutation<TermsDocument, PublishTermsRequest>({
      query: (request) => ({
        url: PATH.cms.terms,
        method: 'post',
        json: request,
        authenticated: true,
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : ['TermsDocument', 'CheckoutTerms'],
    }),
    paymentTerms: build.query<PaymentTermsReview, string>({
      query: (paymentId) => ({
        url: `${PATH.payments}/${paymentId}/terms`,
        authenticated: true,
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
        authenticated: true,
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
      query: () => ({ url: PATH.orders, authenticated: true }),
      providesTags: ['Order'],
    }),
    userProfile: build.query<User, void>({
      query: () => ({ url: PATH.users.profile, authenticated: true }),
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
        authenticated: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    updateAvatar: build.mutation<User, FormData>({
      query: (body) => ({
        url: PATH.users.avatar,
        method: 'post',
        body,
        authenticated: true,
      }),
      invalidatesTags: ['Profile', 'User'],
    }),
    cmsBooks: build.query<BookWithAuthorId[], void>({
      query: () => ({ url: PATH.cms.books, authenticated: true }),
      providesTags: ['Book'],
    }),
    cmsAuthors: build.query<Author[], void>({
      query: () => ({ url: PATH.cms.authors, authenticated: true }),
      providesTags: ['Author'],
    }),
    cmsOrders: build.query<CmsOrder[], void>({
      query: () => ({ url: PATH.cms.orders, authenticated: true }),
      providesTags: ['Order'],
    }),
    cmsUsers: build.query<CmsUser[], void>({
      query: () => ({ url: PATH.cms.users, authenticated: true }),
      providesTags: ['User'],
    }),
    cmsEmailOutbox: build.query<EmailOutboxResponse, EmailOutboxQuery>({
      query: (criteria) => ({
        url: PATH.cms.emailOutbox,
        searchParams: criteria,
        authenticated: true,
      }),
      keepUnusedDataFor: 0,
    }),
    addBook: build.mutation<BookWithAuthorId, BookCreate>({
      query: (json) => ({
        url: PATH.cms.books,
        method: 'post',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['Book'],
    }),
    updateBook: build.mutation<BookWithAuthorId, BookUpdate>({
      query: (json) => ({
        url: PATH.cms.books,
        method: 'patch',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['Book'],
    }),
    hardDeleteBooks: build.mutation<BookWithAuthorId['id'][], number[]>({
      query: (bookIds) => ({
        url: PATH.cms.books,
        method: 'delete',
        json: { bookIds },
        authenticated: true,
      }),
      invalidatesTags: ['Book'],
    }),
    addAuthor: build.mutation<Author, AuthorCreate>({
      query: (json) => ({
        url: PATH.cms.authors,
        method: 'post',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
    updateAuthor: build.mutation<Author, AuthorUpdate>({
      query: (json) => ({
        url: PATH.cms.authors,
        method: 'patch',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
    hardDeleteAuthors: build.mutation<Author['id'][], number[]>({
      query: (authorIds) => ({
        url: PATH.cms.authors,
        method: 'delete',
        json: { authorIds },
        authenticated: true,
      }),
      invalidatesTags: ['Author', 'Book'],
    }),
    addUser: build.mutation<CmsUser, CmsUserCreate>({
      query: (json) => ({
        url: PATH.cms.users,
        method: 'post',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    updateUser: build.mutation<CmsUser, CmsUserUpdate>({
      query: (json) => ({
        url: PATH.cms.users,
        method: 'patch',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    softDeleteUsers: build.mutation<number, number[]>({
      query: (userIds) => ({
        url: PATH.cms.users,
        method: 'delete',
        json: { userIds },
        authenticated: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    restoreUsers: build.mutation<number, number[]>({
      query: (userIds) => ({
        url: PATH.cms.restore.users,
        method: 'patch',
        json: { userIds },
        authenticated: true,
      }),
      invalidatesTags: ['User', 'Profile'],
    }),
    updateOrder: build.mutation<CmsOrder, CmsOrderUpdate>({
      query: (json) => ({
        url: PATH.cms.orders,
        method: 'patch',
        json,
        authenticated: true,
      }),
      invalidatesTags: ['Order'],
    }),
    softDeleteOrders: build.mutation<number, number[]>({
      query: (orderIds) => ({
        url: PATH.cms.orders,
        method: 'delete',
        json: { orderIds },
        authenticated: true,
      }),
      invalidatesTags: ['Order'],
    }),
    restoreOrders: build.mutation<number, number[]>({
      query: (orderIds) => ({
        url: PATH.cms.restore.orders,
        method: 'patch',
        json: { orderIds },
        authenticated: true,
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
  typeof kyBaseQuery
>

type QueryOptions<
  Result,
  Selected extends Record<string, unknown>,
> = TypedUseQuerySubscriptionOptions &
  TypedUseQueryStateOptions<Result, void, typeof kyBaseQuery, Selected>

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
