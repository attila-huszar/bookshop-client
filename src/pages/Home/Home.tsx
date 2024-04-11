import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store/selectors'
import { StyledHome } from './Home.styles'
import { Card } from '../../components'
import { Loading } from '../../components'
import { Error } from '../../components'

export function Home() {
  const { booksData, booksIsLoading, booksError } =
    useAppSelector(booksSelector)

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
