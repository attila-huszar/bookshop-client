import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBooks, bookState } from '../../store/booksSlice'
import { AppDispatch } from '../../store/store'
import { StyledHome } from './Home.styles'
import { Card } from '../../components'
import { Loading } from '../../components'
import { Error } from '../../components'

export function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const { data, isLoading, error } = useSelector(bookState)

  useEffect(() => {
    dispatch(fetchBooks())
  }, [dispatch])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Error error={error} />
  }

  return (
    <StyledHome>
      {data.map((item) => (
        <Card key={item.id} {...item} />
      ))}
    </StyledHome>
  )
}
