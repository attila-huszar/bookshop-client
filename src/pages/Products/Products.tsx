import { useTranslation } from 'react-i18next'
import { booksApi, useBooksQuery } from '@/store/api/booksApi'
import { booksQueryArgs } from '@/store/selectors'
import { setBooksCurrentPage } from '@/store/slices/books'
import { Alert } from '@/components/Alert'
import { Card } from '@/components/Card'
import { Loading } from '@/components/Loading'
import { Pagination } from '@/components/Pagination'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { CacheTime } from '@/constants/time'
import { EmptyFilterResults, Filter } from './components'
import { StyledFilter } from './components/Filter/Filter.style'
import { MobileFilters } from './components/Filter/MobileFilters'
import {
  ProductsGrid,
  ResultsStatus,
  ShopHeading,
  StyledProducts,
} from './Products.style'

function Products() {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()
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
      <section>
        <ShopHeading>{t('navigation.shop')}</ShopHeading>
        <ResultsStatus aria-live="polite" aria-atomic="true">
          {page && !booksError
            ? t('catalogue.matchingBooks', { count: page.total })
            : null}
        </ResultsStatus>
        {renderBooks()}
      </section>
      {isMobile ? (
        <MobileFilters />
      ) : (
        <StyledFilter aria-labelledby="shop-filters-title">
          <ShopHeading as="h2" id="shop-filters-title">
            {t('filters.title')}
          </ShopHeading>
          <Filter />
        </StyledFilter>
      )}
    </StyledProducts>
  )
}

export { Products as Component }
