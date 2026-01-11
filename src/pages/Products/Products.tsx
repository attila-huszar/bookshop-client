import { booksSelector } from '@/store'
import { Card } from '@/components'
import { useAppSelector } from '@/hooks'
import { EmptyFilterResults, Filter, Pagination } from './components'
import { StyledProducts } from './Products.style'

export function Products() {
  const { booksOnCurrentPage } = useAppSelector(booksSelector)

  const renderBooks = () =>
    booksOnCurrentPage.length ? (
      <>
        <div>
          {booksOnCurrentPage.map((book) => (
            <Card key={book.id} book={book} />
          ))}
        </div>
        <Pagination />
      </>
    ) : (
      <EmptyFilterResults />
    )

  return (
    <StyledProducts>
      <section>{renderBooks()}</section>
      <Filter />
    </StyledProducts>
  )
}
