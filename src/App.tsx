import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes/routes'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks'
import {
  fetchBooks,
  fetchBooksByProperty,
  fetchBookSearchOptions,
  getBooksRandomized,
  fetchAllNews,
  fetchCartItems,
  fetchUserByUUID,
} from './store'
import { ILocalCart } from './interfaces'
import GlobalStyle from './styles/Global.styles'

function App() {
  const router = createBrowserRouter(routes)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchBooks()).then(() => {
      dispatch(getBooksRandomized())
    })
    dispatch(fetchBooksByProperty('new'))
    dispatch(fetchBooksByProperty('topSellers'))
    dispatch(fetchAllNews())
    dispatch(fetchBookSearchOptions())

    const uuid: string | null = JSON.parse(
      localStorage.getItem('uuid') || 'null',
    )
    if (uuid) {
      dispatch(fetchUserByUUID(uuid))
    }

    const cart: ILocalCart[] = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cart.length) {
      dispatch(fetchCartItems(cart))
    }
  }, [dispatch])

  return (
    <>
      <RouterProvider router={router} />
      <GlobalStyle />
    </>
  )
}

export default App
