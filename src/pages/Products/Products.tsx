import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { StyledProducts } from './Products.styles'
import { useAppSelector } from 'hooks'
import { booksSelector } from 'store'
import { Card, Loading, Error } from 'components'
import { Filter, EmptyFilterResults, Pagination } from './components'

export function Products() {
  const { booksInShop, booksAreLoading, booksError } =
    useAppSelector(booksSelector)

  return (
    <StyledProducts>
      <ErrorBoundary fallback={<Error error={booksError} />}>
        <Suspense fallback={<Loading />}>
          <section>
            {booksInShop.length ? (
              <>
                <div>
                  {booksInShop.map((book) => (
                    <Card key={book.id} book={book} />
                  ))}
                </div>
                <Pagination />
              </>
            ) : (
              !booksAreLoading && <EmptyFilterResults />
            )}
          </section>
        </Suspense>
        <Filter />
      </ErrorBoundary>
    </StyledProducts>
  )
}
