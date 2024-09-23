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
  fetchUserByUUID,
} from '@/store'
import { ILocalCart } from '@/interfaces'
import GlobalStyle from '@/styles/Global.styles'

function App() {
  const dispatch = useAppDispatch()
  const { getFromLocalStorage } = useLocalStorage()

  useEffect(() => {
    void dispatch(fetchBooks()).then(() => dispatch(fetchRecommendedBooks(4)))
    void dispatch(fetchBooksByProperty('newRelease'))
    void dispatch(fetchBooksByProperty('topSellers'))
    void dispatch(fetchNews())
    void dispatch(fetchBookSearchOptions())

    const uuid = getFromLocalStorage<string>('uuid')
    if (uuid) {
      void dispatch(fetchUserByUUID(uuid))
    }

    const cart = getFromLocalStorage<ILocalCart[]>('cart')
    if (cart) {
      void dispatch(fetchCartItems(cart))
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
