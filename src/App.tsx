import GlobalStyle from './styles/Global.styles'
import { Layout } from './Layout'
import { Header } from './components/Header'
import { Footer } from './components/Footer'

function App() {
  return (
    <>
      <GlobalStyle />
      <Layout>
        <Header />
        <Footer />
      </Layout>
    </>
  )
}

export default App
