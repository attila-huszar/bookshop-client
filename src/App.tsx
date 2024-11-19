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
  fetchTokens,
  fetchUserProfile,
} from '@/store'
import { ILocalCart } from '@/interfaces'
import GlobalStyle from '@/styles/Global.style'

function App() {
  const dispatch = useAppDispatch()
  const { getFromLocalStorage } = useLocalStorage()

  useEffect(() => {
    void dispatch(fetchBooks()).then(() => dispatch(fetchRecommendedBooks(4)))
    void dispatch(fetchBooksByProperty('newRelease'))
    void dispatch(fetchBooksByProperty('topSellers'))
    void dispatch(fetchNews())
    void dispatch(fetchBookSearchOptions())
    void dispatch(fetchTokens())
      .unwrap()
      .then((response) => {
        if (response) {
          void dispatch(fetchUserProfile())
        }
      })

    const cart = getFromLocalStorage<ILocalCart[]>('cart')
    if (cart) {
      void dispatch(fetchCartItems(cart))
    }

    const paymentId = getFromLocalStorage<string>('paymentId')
    if (paymentId) {
      //void dispatch(orderRetrieve(paymentId))
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
