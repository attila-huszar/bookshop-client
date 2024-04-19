import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes/routes'
import { useEffect } from 'react'
import { useAppDispatch, useLocalStorage } from './hooks'
import {
  fetchAllBooks,
  booksRandomize,
  fetchAllNews,
  getUserByID,
} from './store'
import GlobalStyle from './styles/Global.styles'

function App() {
  const router = createBrowserRouter(routes)
  const dispatch = useAppDispatch()
  const { getFromLocalStorage } = useLocalStorage()
  const uuid = getFromLocalStorage('uuid')

  useEffect(() => {
    dispatch(fetchAllBooks()).then(() => {
      dispatch(booksRandomize())
    })
    dispatch(fetchAllNews())

    if (uuid) {
      dispatch(getUserByID(uuid))
    }
  }, [dispatch, uuid])

  return (
    <>
      <RouterProvider router={router} />
      <GlobalStyle />
    </>
  )
}

export default App
