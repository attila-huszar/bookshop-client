import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { booksApi, useBooksQuery } from '@/store/api/booksApi'
import { booksQueryArgs } from '@/store/selectors'
import { setBooksCurrentPage } from '@/store/slices/books'
import { Alert } from '@/components/Alert'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { Pagination } from '@/components/Pagination'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { CacheTime } from '@/constants/cacheTimes'
import { SlidersIcon } from '@/assets/svg'
import { EmptyFilterResults, Filter } from './components'
import {
  FilterBackdrop,
  FilterFloatingButton,
  ProductsGrid,
  StyledProducts,
} from './Products.style'

export function Products() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const queryArgs = useAppSelector(booksQueryArgs)
  const prefetchBooks = booksApi.usePrefetch('books', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
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
        <Pagination
          total={page?.total ?? 0}
          currentPage={queryArgs.currentPage}
          itemsPerPage={queryArgs.itemsPerPage}
          onPageChange={(page) => dispatch(setBooksCurrentPage(page))}
          onPagePrefetch={(page) =>
            prefetchBooks({ ...queryArgs, currentPage: page })
          }
        />
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
