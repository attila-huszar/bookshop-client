import { createSelector } from '@reduxjs/toolkit'
import { booksApi } from './api/booksApi'
import { usersApi } from './api/usersApi'
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

/** Combine errors from the three featured-book queries shown on the homepage. */
export const homeBooksErrorSelector = createSelector(
  [
    booksApi.endpoints.booksByProperty.select('newRelease'),
    booksApi.endpoints.booksByProperty.select('topSellers'),
    booksApi.endpoints.booksByProperty.select('recommended'),
  ],
  (releases, sellers, recommended) =>
    releases.error ?? sellers.error ?? recommended.error,
)

export const userSelector = createSelector(
  [
    (state: RootState) => state.user.accessToken,
    usersApi.endpoints.userProfile.select(),
  ],
  (accessToken, profile) => ({
    accessToken,
    userData: accessToken ? (profile.data ?? null) : null,
    userIsLoading:
      Boolean(accessToken) &&
      (profile.isUninitialized ||
        (profile.isLoading && profile.data === undefined)),
    userError: accessToken ? (profile.error ?? null) : null,
  }),
)
