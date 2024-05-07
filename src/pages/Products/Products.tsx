import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { useAppSelector } from '../../hooks'
import { booksSelector } from '../../store/selectors'
import { StyledProducts } from './Products.styles'
import { Card } from '../../components'
import { Loading } from '../../components'
import { Error } from '../../components'
import { Filter } from './components/Filter/Filter'

export function Products() {
  const { booksData, booksError } = useAppSelector(booksSelector)

  return (
    <StyledProducts>
      <ErrorBoundary fallback={<Error error={booksError} />}>
        <Suspense fallback={<Loading />}>
          <main>
            {booksData.map((book) => (
              <Card key={book.id} book={book} />
            ))}
          </main>
        </Suspense>
        <Filter />
      </ErrorBoundary>
    </StyledProducts>
  )
}
