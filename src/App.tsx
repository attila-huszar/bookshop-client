import { Provider } from 'react-redux'
import { store } from './store/store'
import { Layout } from './pages'
import { useRoutes } from 'react-router-dom'
import { routes } from './routes/routes'
import GlobalStyle from './styles/Global.styles'

function App() {
  const routeElements = useRoutes(routes)

  return (
    <Provider store={store}>
      <GlobalStyle />
      <Layout>{routeElements}</Layout>
    </Provider>
  )
}

export default App
