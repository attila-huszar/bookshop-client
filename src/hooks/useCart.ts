import { useEffect, useMemo } from 'react'
import { createSelector } from '@reduxjs/toolkit'
import { booksApi } from '@/store/api/booksApi'
import { refreshCartPrices } from '@/services/checkout'
import { CacheTime } from '@/constants/cacheTimes'
import type { Cart } from '@/types'
import { useAppDispatch, useAppSelector } from './redux'

/** Subscribe to book data without copying prices or titles into cart intent. */
export function useCart() {
  const dispatch = useAppDispatch()
  const items = useAppSelector((state) => state.cart.cartItems)
  const selectDetails = useMemo(
    () =>
      createSelector(
        items.map((item) => booksApi.endpoints.book.select(item.id)),
        (...queries) => {
          const cartItems: Cart[] = queries.flatMap((query, index) => {
            const book = query.data
            const item = items[index]

            if (!book || !item) {
              return []
            }

            return [
              {
                id: item.id,
                quantity: item.quantity,
                title: book.title,
                price: book.price,
                discount: book.discount,
                discountPrice: book.discountPrice,
                imgUrl: book.imgUrl,
              },
            ]
          })

          return {
            cartItems,
            isLoading: queries.some(
              (query) =>
                query.isUninitialized ||
                (query.isLoading && query.data === undefined),
            ),
            isFetching: queries.some((query) => query.isLoading),
            error: queries.find((query) => query.isError)?.error,
          }
        },
      ),
    [items],
  )
  const details = useAppSelector(selectDetails)

  useEffect(() => {
    const subscriptions = items.map((item) =>
      dispatch(
        booksApi.endpoints.book.initiate(item.id, {
          forceRefetch: CacheTime.FiveMinutes,
        }),
      ),
    )

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe())
    }
  }, [dispatch, items])

  return { ...details, refetch: () => dispatch(refreshCartPrices()) }
}
