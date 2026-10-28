import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBooksQuery } from '@/store/api/booksApi'
import { booksQueryArgs } from '@/store/selectors'
import { Alert } from '@/components/Alert'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { useAppSelector } from '@/hooks/redux'
import { CacheTime } from '@/constants/cacheTimes'
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
  const {
    currentData: page,
    isFetching,
    error: booksError,
  } = useBooksQuery(queryArgs, {
    refetchOnMountOrArgChange: CacheTime.FiveMinutes,
  })
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const books = page?.books ?? []

  const renderBooks = () => {
    if (isFetching && !page) {
      return <Loading message={t('catalogue.loading')} fullScreen />
    }

    if (booksError) {
      return <Alert message={t('catalogue.error')} error={booksError} />
    }

    return books.length ? (
      <>
        <ProductsGrid>
          {books.map((book) => (
            <Card key={book.id} book={book} />
          ))}
        </ProductsGrid>
        <Pagination total={page?.total ?? 0} />
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
