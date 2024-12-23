import { useEffect } from 'react'
import { Routes } from '@/routes'
import { useAppDispatch, useAppSelector, useLocalStorage } from '@/hooks'
import {
  fetchBooks,
  fetchBooksByProperty,
  fetchBookSearchOptions,
  fetchRecommendedBooks,
  fetchNews,
  fetchCartItems,
  fetchAuthTokens,
  fetchUserProfile,
  orderRetrieve,
} from '@/store'
import type { CartLocalStorage } from '@/types'
import GlobalStyle from '@/styles/Global.style'

function App() {
  const dispatch = useAppDispatch()
  const { accessToken } = useAppSelector((state) => state.user)
  const { getFromLocalStorage } = useLocalStorage()

  useEffect(() => {
    void dispatch(fetchAuthTokens())
    void dispatch(fetchBooks()).then(() => dispatch(fetchRecommendedBooks(4)))
    void dispatch(fetchBooksByProperty('newRelease'))
    void dispatch(fetchBooksByProperty('topSellers'))
    void dispatch(fetchNews())
    void dispatch(fetchBookSearchOptions())
  }, [dispatch])

  useEffect(() => {
    if (accessToken) {
      void dispatch(fetchUserProfile())
    }
  }, [dispatch, accessToken])

  useEffect(() => {
    const cart = getFromLocalStorage<CartLocalStorage[]>('cart')
    if (cart) {
      void dispatch(fetchCartItems(cart))
    }

    const paymentId = getFromLocalStorage<string>('paymentId')
    if (paymentId) {
      void dispatch(orderRetrieve(paymentId))
    }
  }, [dispatch, getFromLocalStorage])

  return (
    <>
      <Routes />
      <GlobalStyle />
    </>
  )
}

export default App
