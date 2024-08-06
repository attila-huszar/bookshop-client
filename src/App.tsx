import { useEffect } from 'react'
import { Routes } from 'routes/Routes_'
import { useAppDispatch, useLocalStorage } from 'hooks'
import {
  fetchBooks,
  fetchBooksByProperty,
  fetchBookSearchOptions,
  fetchRecommendedBooks,
  fetchNews,
  fetchCartItems,
  fetchUserByUUID,
} from 'store'
import { ILocalCart } from 'interfaces'
import GlobalStyle from 'styles/Global.styles'

function App() {
  const dispatch = useAppDispatch()
  const { getFromLocalStorage } = useLocalStorage()

  useEffect(() => {
    dispatch(fetchBooks()).then(() => dispatch(fetchRecommendedBooks(4)))
    dispatch(fetchBooksByProperty('new'))
    dispatch(fetchBooksByProperty('topSellers'))
    dispatch(fetchNews())
    dispatch(fetchBookSearchOptions())

    const uuid = getFromLocalStorage<string>('uuid')
    if (uuid) {
      dispatch(fetchUserByUUID(uuid))
    }

    const cart = getFromLocalStorage<ILocalCart[]>('cart')
    if (cart) {
      dispatch(fetchCartItems(cart))
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
