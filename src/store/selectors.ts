import { createSelector } from '@reduxjs/toolkit'
import { bookshopApi } from './api/bookshopApi'
import type { RootState } from './store'

export const booksQueryArgs = createSelector(
  [
    (state: Pick<RootState, 'books'>) => state.books.booksCurrentPage,
    (state: Pick<RootState, 'books'>) => state.books.booksPerPage,
    (state: Pick<RootState, 'books'>) => state.books.booksAppliedFilters,
  ],
  (currentPage, itemsPerPage, criteria) => ({
    currentPage,
    itemsPerPage,
    criteria,
  }),
)

const message = (error: unknown): string | null =>
  error &&
  typeof error === 'object' &&
  'message' in error &&
  typeof error.message === 'string'
    ? error.message
    : null

const isQueryLoading = (query: {
  isUninitialized: boolean
  isLoading: boolean
  data?: unknown
}) => query.isUninitialized || (query.isLoading && query.data === undefined)

const selectBooksPageQuery = createSelector([booksQueryArgs], (args) =>
  bookshopApi.endpoints.books.select(args),
)

/** Presentation values derived from UI state and the relevant query entries. */
export const booksSelector = createSelector(
  [
    (state: RootState) => state.books,
    (state: RootState) => selectBooksPageQuery(state)(state),
    bookshopApi.endpoints.booksByProperty.select('newRelease'),
    bookshopApi.endpoints.booksByProperty.select('topSellers'),
    bookshopApi.endpoints.booksByProperty.select('recommended'),
    bookshopApi.endpoints.searchOptions.select(),
  ],
  (ui, page, releases, sellers, recommended, searchOptions) => ({
    ...ui,
    booksTotal: page.data?.total ?? 0,
    booksOnCurrentPage: page.data?.books ?? [],
    booksIsLoading:
      page.isUninitialized || (page.isLoading && !page.data?.books.length),
    booksFiltersLoading: isQueryLoading(searchOptions),
    booksFiltersError: message(searchOptions.error),
    booksReleases: releases.data ?? [],
    booksTopSellers: sellers.data ?? [],
    booksRecommended: recommended.data ?? [],
    booksError: message(
      page.error ?? releases.error ?? sellers.error ?? recommended.error,
    ),
  }),
)

export const authorByIdSelector =
  (id: number | undefined) => (state: RootState) =>
    id === undefined
      ? null
      : (bookshopApi.endpoints.author.select(id)(state).data ?? null)

export const newsSelector = createSelector(
  [bookshopApi.endpoints.news.select()],
  (q) => ({
    newsItems: q.data ?? [],
    newsIsLoading: isQueryLoading(q),
    newsError: message(q.error),
  }),
)

export const ordersSelector = createSelector(
  [bookshopApi.endpoints.userOrders.select()],
  (q) => ({
    orders: q.data ?? [],
    ordersIsLoading: isQueryLoading(q),
    ordersError: message(q.error),
  }),
)

export const userSelector = createSelector(
  [
    (state: RootState) => state.user,
    bookshopApi.endpoints.userProfile.select(),
  ],
  (session, profile) => ({
    ...session,
    userData: session.accessToken ? (profile.data ?? null) : null,
    userIsLoading: Boolean(session.accessToken) && isQueryLoading(profile),
    userError: session.accessToken ? message(profile.error) : null,
  }),
)
export const cartSelector = createSelector(
  [(state: Pick<RootState, 'cart'>) => state.cart],
  (cart) => ({
    ...cart,
    cartIsLoading: cart.currentRequestId !== null,
  }),
)
export const paymentSelector = (state: RootState) => state.payment

export const cmsBooksSelector = createSelector(
  [bookshopApi.endpoints.cmsBooks.select()],
  (q) => ({
    books: q.data ?? [],
    booksLoading: isQueryLoading(q),
    booksError: message(q.error),
  }),
)

export const cmsAuthorsSelector = createSelector(
  [bookshopApi.endpoints.cmsAuthors.select()],
  (q) => ({
    authors: q.data ?? [],
    authorsLoading: isQueryLoading(q),
    authorsError: message(q.error),
  }),
)

export const cmsUsersSelector = createSelector(
  [bookshopApi.endpoints.cmsUsers.select()],
  (q) => ({
    users: q.data ?? [],
    usersLoading: isQueryLoading(q),
    usersError: message(q.error),
  }),
)

export const cmsOrdersSelector = createSelector(
  [bookshopApi.endpoints.cmsOrders.select()],
  (q) => ({
    orders: q.data ?? [],
    ordersLoading: isQueryLoading(q),
    ordersError: message(q.error),
  }),
)
