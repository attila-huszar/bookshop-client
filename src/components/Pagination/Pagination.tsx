import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/Button'
import { scrollToTop } from '@/helpers/scrollToTop'
import { CaretLeftEndIcon, CaretLeftIcon, EllipsisIcon } from '@/assets/svg'
import { PageSelectButton, StyledPagination } from './Pagination.style'

type PaginationProps = {
  total: number
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onPagePrefetch?: (page: number) => void
}

export function Pagination({
  total,
  currentPage,
  itemsPerPage,
  onPageChange,
  onPagePrefetch,
}: PaginationProps) {
  const { t } = useTranslation()
  const totalPages = Math.ceil(total / itemsPerPage)

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return
    }

    onPageChange(page)
    scrollToTop()
  }

  const prefetchPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPagePrefetch?.(page)
    }
  }

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    range.push(1)

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (totalPages > 1) {
      range.push(totalPages)
    }

    let prev = 0
    for (const page of range) {
      if (page - prev === 2) {
        rangeWithDots.push(prev + 1)
      } else if (page - prev !== 1) {
        rangeWithDots.push('ellipsis')
      }

      rangeWithDots.push(page)
      prev = page
    }

    return rangeWithDots
  }

  if (totalPages === 0) {
    return null
  }

  const pageNumbers = getPageNumbers()

  return (
    <StyledPagination>
      <IconButton
        type="button"
        onClick={() => changePage(1)}
        icon={<CaretLeftEndIcon />}
        title={t('pagination.first')}
        onMouseEnter={() => prefetchPage(1)}
        onFocus={() => prefetchPage(1)}
        $size="sm"
        disabled={currentPage === 1}
      />
      <IconButton
        type="button"
        onClick={() => changePage(currentPage - 1)}
        icon={<CaretLeftIcon />}
        title={t('pagination.previous')}
        onMouseEnter={() => prefetchPage(currentPage - 1)}
        onFocus={() => prefetchPage(currentPage - 1)}
        $size="sm"
        disabled={currentPage === 1}
      />
      {pageNumbers.map((pageNumber, idx) => {
        if (pageNumber === 'ellipsis') {
          return <EllipsisIcon key={`ellipsis-${idx}`} width={14} />
        }

        const page = pageNumber as number

        return (
          <PageSelectButton
            type="button"
            key={`pageSelectBtn-${page}`}
            onMouseEnter={() => prefetchPage(page)}
            onFocus={() => prefetchPage(page)}
            onClick={() => changePage(page)}
            disabled={currentPage === page}
            aria-current={currentPage === page ? 'page' : undefined}
            aria-label={t('pagination.page', { page: page })}>
            {page}
          </PageSelectButton>
        )
      })}
      <IconButton
        type="button"
        onClick={() => changePage(currentPage + 1)}
        icon={<CaretLeftIcon />}
        title={t('pagination.next')}
        onMouseEnter={() => prefetchPage(currentPage + 1)}
        onFocus={() => prefetchPage(currentPage + 1)}
        $size="sm"
        $flipH
        disabled={currentPage === totalPages}
      />
      <IconButton
        type="button"
        onClick={() => changePage(totalPages)}
        icon={<CaretLeftEndIcon />}
        title={t('pagination.last')}
        onMouseEnter={() => prefetchPage(totalPages)}
        onFocus={() => prefetchPage(totalPages)}
        $size="sm"
        $flipH
        disabled={currentPage === totalPages}
      />
    </StyledPagination>
  )
}
