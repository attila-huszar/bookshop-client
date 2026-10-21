import { createSelector } from '@reduxjs/toolkit'
import { getApiError } from '@/helpers/errors'
import type { ApiError } from '@/types/ApiError'
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

const message = (error: unknown): string | ApiError | null => {
  const apiError = getApiError(error)

  if (apiError) {
    return apiError
  }

  return error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
    ? error.message
    : null
}

const isQueryLoading = (query: {
  isUninitialized: boolean
  isLoading: boolean
  data?: unknown
}) => query.isUninitialized || (query.isLoading && query.data === undefined)

/** Combine errors from the three featured-book queries shown on the homepage. */
export const homeBooksErrorSelector = createSelector(
  [
    bookshopApi.endpoints.booksByProperty.select('newRelease'),
    bookshopApi.endpoints.booksByProperty.select('topSellers'),
    bookshopApi.endpoints.booksByProperty.select('recommended'),
  ],
  (releases, sellers, recommended) =>
    releases.error ?? sellers.error ?? recommended.error,
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
