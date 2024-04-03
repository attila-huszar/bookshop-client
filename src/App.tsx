import { Provider } from 'react-redux'
import { store } from './store/store'
import { Layout, Home } from './pages'
import GlobalStyle from './styles/Global.styles'

function App() {
  return (
    <Provider store={store}>
      <GlobalStyle />
      <Layout>
        <Home />
      </Layout>
    </Provider>
  )
}

export default App
