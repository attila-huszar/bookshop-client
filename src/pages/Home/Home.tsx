import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBooks } from '../../store/booksSlice'
import { booksSelector } from '../../store/selectors'
import { AppDispatch } from '../../store/store'
import { StyledHome } from './Home.styles'
import { Card } from '../../components'
import { Loading } from '../../components'
import { Error } from '../../components'

export function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const { booksData, booksIsLoading, booksError } = useSelector(booksSelector)

  useEffect(() => {
    if (!booksData.length) {
      dispatch(fetchBooks())
    }
  }, [booksData, dispatch])

  if (booksIsLoading) {
    return <Loading />
  }

  if (booksError) {
    return <Error error={booksError} />
  }

  return (
    <StyledHome>
      {booksData.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </StyledHome>
  )
}
