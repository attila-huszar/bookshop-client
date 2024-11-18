import { useEffect } from 'react'
import { Routes } from '@/routes'
import { useAppDispatch, useLocalStorage } from '@/hooks'
import {
  fetchBooks,
  fetchBooksByProperty,
  fetchBookSearchOptions,
  fetchRecommendedBooks,
  fetchNews,
  fetchCartItems,
  orderRetrieve,
  setUserData,
} from '@/store'
import { ILocalCart } from '@/interfaces'
import GlobalStyle from '@/styles/Global.style'
import { PATH } from './constants'
import { authApi } from './api/api'
import { getCookie } from './helpers'

function App() {
  const dispatch = useAppDispatch()
  const { getFromLocalStorage } = useLocalStorage()

  useEffect(() => {
    void dispatch(fetchBooks()).then(() => dispatch(fetchRecommendedBooks(4)))
    void dispatch(fetchBooksByProperty('newRelease'))
    void dispatch(fetchBooksByProperty('topSellers'))
    void dispatch(fetchNews())
    void dispatch(fetchBookSearchOptions())

    async function getUserProfile() {
      const user = await authApi.get(`${PATH.users}/profile`).json()
      dispatch(setUserData(user))
    }

    if (getCookie('uuid')) {
      getUserProfile()
    }

    const cart = getFromLocalStorage<ILocalCart[]>('cart')
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
