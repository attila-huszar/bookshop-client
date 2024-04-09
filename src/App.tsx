import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes/routes'
import { useEffect } from 'react'
import { useAppDispatch } from './hooks'
import { fetchBooks } from './api'
import GlobalStyle from './styles/Global.styles'
import { randomBooks } from './store/booksSlice'

function App() {
  const router = createBrowserRouter(routes)
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchBooks()).then(() => {
      dispatch(randomBooks())
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
