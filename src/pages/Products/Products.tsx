import { useState } from 'react'
import { booksSelector } from '@/store'
import { useBooksQuery, useSearchOptionsQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { booksQueryArgs } from '@/store/selectors'
import { Alert, Card, Loading } from '@/components'
import { useAppSelector } from '@/hooks'
import { SlidersIcon } from '@/assets/svg'
import { EmptyFilterResults, Filter, Pagination } from './components'
import {
  FilterBackdrop,
  FilterFloatingButton,
  ProductsGrid,
  StyledProducts,
} from './Products.style'

export function Products() {
  const queryArgs = useAppSelector(booksQueryArgs)

  useBooksQuery(queryArgs, {
    refetchOnMountOrArgChange: cacheTimes.catalogue,
  })
  useSearchOptionsQuery({
    refetchOnMountOrArgChange: cacheTimes.reference,
  })
  const { booksOnCurrentPage, booksIsLoading, booksError } =
    useAppSelector(booksSelector)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const renderBooks = () => {
    if (booksIsLoading) {
      return <Loading message="Loading books" fullScreen />
    }

    if (booksError) {
      return <Alert message="Error loading books" error={booksError} />
    }

    return booksOnCurrentPage.length ? (
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
  }

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
        <SlidersIcon />
      </FilterFloatingButton>
      <FilterBackdrop
        $visible={isFilterOpen}
        onClick={() => setIsFilterOpen(false)}
      />
    </StyledProducts>
  )
}
