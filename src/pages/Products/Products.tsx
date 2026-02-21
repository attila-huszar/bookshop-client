import { useState } from 'react'
import { booksSelector } from '@/store'
import { Card } from '@/components/Card/Card'
import { useAppSelector } from '@/hooks'
import { FilterIcon } from '@/assets/svg'
import { EmptyFilterResults, Filter, Pagination } from './components'
import {
  FilterBackdrop,
  FilterFloatingButton,
  ProductsGrid,
  StyledProducts,
} from './Products.style'

export function Products() {
  const { booksOnCurrentPage } = useAppSelector(booksSelector)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const renderBooks = () =>
    booksOnCurrentPage.length ? (
      <>
        <ProductsGrid>
          {booksOnCurrentPage.map((book) => (
            <Card key={book.id} book={book} />
          ))}
        </ProductsGrid>
        <Pagination />
      </>
    ) : (
      <EmptyFilterResults />
    )

  return (
    <StyledProducts>
      <section>{renderBooks()}</section>
      <Filter
        isMobileOpen={isFilterOpen}
        onMobileClose={() => setIsFilterOpen(false)}
      />
      <FilterFloatingButton
        type="button"
        onClick={() => setIsFilterOpen((prev) => !prev)}
        aria-label={isFilterOpen ? 'Close filters' : 'Open filters'}>
        <FilterIcon />
      </FilterFloatingButton>
      <FilterBackdrop
        $visible={isFilterOpen}
        onClick={() => setIsFilterOpen(false)}
      />
    </StyledProducts>
  )
}
