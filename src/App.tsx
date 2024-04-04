import { Provider } from 'react-redux'
import { store } from './store/store'
import { Layout } from './pages'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { routes } from './routes/routes'
import GlobalStyle from './styles/Global.styles'

function App() {
  const router = createBrowserRouter(routes)

  return (
    <Provider store={store}>
      <GlobalStyle />
      <Layout>
        <RouterProvider router={router} />
      </Layout>
    </Provider>
  )
}

export default App
