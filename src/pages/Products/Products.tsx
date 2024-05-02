import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store/selectors'
import { StyledProducts } from './Products.styles'
import { Card } from '../../components'
import { Loading } from '../../components'
import { Error } from '../../components'
import { Filter } from './components/Filter/Filter'

export function Products() {
  const { booksData, booksAreLoading, booksError } =
    useAppSelector(booksSelector)

  if (booksAreLoading) {
    return <Loading />
  }

  if (booksError) {
    return <Error error={booksError} />
  }

  return (
    <StyledProducts>
      <div>
        {booksData.map((book) => (
          <Card key={book.id} book={book} />
        ))}
      </div>
      <Filter />
    </StyledProducts>
  )
}
