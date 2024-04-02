import { useState, useEffect } from 'react'
import { fetchData } from './api/fetch'
import { Layout, Home } from './pages'
import { IBook } from './interfaces/IBook'
import GlobalStyle from './styles/Global.styles'

function App() {
  const [data, setData] = useState<IBook[]>()

  useEffect(() => {
    fetchData('books')
      .then((books) => setData(books))
      .catch((error) => setData(error))
  }, [])

  return (
    <>
      <GlobalStyle />
      <Layout>
        <Home data={data} />
      </Layout>
    </>
  )
}

export default App
