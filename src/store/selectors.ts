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
    (state: RootState) => state.auth.accessToken,
    (state: RootState) => state.auth.isRestoring,
    usersApi.endpoints.userProfile.select(),
  ],
  (accessToken, isRestoring, profile) => {
    if (!accessToken) {
      return {
        accessToken,
        userData: null,
        userIsLoading: isRestoring,
        userError: null,
      }
    }

    const profileIsLoading =
      profile.data === undefined &&
      (profile.isUninitialized || profile.isLoading)

    return {
      accessToken,
      userData: profile.data ?? null,
      userIsLoading: isRestoring || profileIsLoading,
      userError: profile.error ?? null,
    }
  },
)
