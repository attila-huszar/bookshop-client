import { StyledProducts } from './Products.styles'
import { useAppSelector } from '@/hooks'
import { booksSelector } from '@/store'
import { Card } from '@/components'
import { Filter, EmptyFilterResults, Pagination } from './components'

export function Products() {
  const { booksInShop, booksAreLoading } = useAppSelector(booksSelector)

  return (
    <StyledProducts>
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
      <Filter />
    </StyledProducts>
  )
}
