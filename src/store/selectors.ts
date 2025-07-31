import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from './store'

export const booksSelector = (state: RootState) => state.books

export const authorsSelector = (state: RootState) => state.authors

export const authorByIdSelector =
  (id: number | undefined) => (state: RootState) => {
    if (id === undefined) return null

    return state.authors.authorArray.find((author) => author.id === id) ?? null
  }

export const newsSelector = (state: RootState) => state.news

export const userSelector = (state: RootState) => state.user

export const cartSelector = (state: RootState) => state.cart

export const orderSelector = (state: RootState) => state.order

export const cmsBooksSelector = createSelector(
  [
    (state: RootState) => state.cms.books,
    (state: RootState) => state.cms.booksLoading,
    (state: RootState) => state.cms.booksError,
  ],
  (books, booksLoading, booksError) => ({
    books,
    booksLoading,
    booksError,
  }),
)

export const cmsAuthorsSelector = createSelector(
  [
    (state: RootState) => state.cms.authors,
    (state: RootState) => state.cms.authorsLoading,
    (state: RootState) => state.cms.authorsError,
  ],
  (authors, authorsLoading, authorsError) => ({
    authors,
    authorsLoading,
    authorsError,
  }),
)

export const cmsUsersSelector = createSelector(
  [
    (state: RootState) => state.cms.users,
    (state: RootState) => state.cms.usersLoading,
    (state: RootState) => state.cms.usersError,
  ],
  (users, usersLoading, usersError) => ({
    users,
    usersLoading,
    usersError,
  }),
)

export const cmsOrdersSelector = createSelector(
  [
    (state: RootState) => state.cms.orders,
    (state: RootState) => state.cms.ordersLoading,
    (state: RootState) => state.cms.ordersError,
  ],
  (orders, ordersLoading, ordersError) => ({
    orders,
    ordersLoading,
    ordersError,
  }),
)

export const cmsNewsSelector = createSelector(
  [
    (state: RootState) => state.cms.news,
    (state: RootState) => state.cms.newsLoading,
    (state: RootState) => state.cms.newsError,
  ],
  (news, newsIsLoading, newsError) => ({
    news,
    newsIsLoading,
    newsError,
  }),
)
