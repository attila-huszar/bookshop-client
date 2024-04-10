import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes/routes'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks'
import { fetchAllBooks, booksRandomize } from './store'
import GlobalStyle from './styles/Global.styles'

function App() {
  const router = createBrowserRouter(routes)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchAllBooks()).then(() => {
      dispatch(booksRandomize())
    })
  }, [dispatch])

  return (
    <>
      <RouterProvider router={router} />
      <GlobalStyle />
    </>
  )
}

export default App
