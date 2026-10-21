import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBooksQuery, useSearchOptionsQuery } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { booksSelector } from '@/store/selectors'
import { booksQueryArgs } from '@/store/selectors'
import { Alert } from '@/components/Alert'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { useAppSelector } from '@/hooks/redux'
import { SlidersIcon } from '@/assets/svg'
import { EmptyFilterResults, Filter, Pagination } from './components'
import {
  FilterBackdrop,
  FilterFloatingButton,
  ProductsGrid,
  StyledProducts,
} from './Products.style'

export function Products() {
  const { t } = useTranslation()

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
      return <Loading message={t('catalogue.loading')} fullScreen />
    }

    if (booksError) {
      return <Alert message={t('catalogue.error')} error={booksError} />
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
        aria-label={isFilterOpen ? t('filters.close') : t('filters.open')}>
        <SlidersIcon />
      </FilterFloatingButton>
      <FilterBackdrop
        $visible={isFilterOpen}
        onClick={() => setIsFilterOpen(false)}
      />
    </StyledProducts>
  )
}
