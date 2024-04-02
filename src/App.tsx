import GlobalStyle from './styles/Global.styles'
import { Layout } from './pages'
import { Card } from './components'

const mockData = {
  title: 'The Odyssey',
  description:
    'The epic poem following the Greek hero Odysseus on his journey home from the Trojan War.',
  price: '30.97',
  discount: 17,
  imgUrl: '',
}

function App() {
  const { title, description, price, discount, imgUrl } = mockData

  return (
    <>
      <GlobalStyle />
      <Layout>
        <Card {...{ title, description, price, discount, imgUrl }} />
      </Layout>
    </>
  )
}

export default App
