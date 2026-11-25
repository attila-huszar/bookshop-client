import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/Button'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { scrollToTop } from '@/helpers/scrollToTop'
import { uiTiming } from '@/constants/time'
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

  const prefetchPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPagePrefetch?.(page)
    }
  }

  const schedulePagePrefetch = useDebouncedCallback(
    prefetchPage,
    uiTiming.prefetchDelayMs,
  )
  const prefetchPageOnHover = onPagePrefetch ? schedulePagePrefetch : undefined

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return
    }

    schedulePagePrefetch.cancel()
    onPageChange(page)
    scrollToTop()
  }

  const getPageNumbers = () => {
    const delta = 2
    const range = []
    const rangeWithDots: (number | 'ellipsis')[] = []

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
        onMouseEnter={() => prefetchPageOnHover?.(1)}
        onMouseLeave={prefetchPageOnHover?.cancel}
        onFocus={() => prefetchPage(1)}
        $size="sm"
        disabled={currentPage === 1}
      />
      <IconButton
        type="button"
        onClick={() => changePage(currentPage - 1)}
        icon={<CaretLeftIcon />}
        title={t('pagination.previous')}
        onMouseEnter={() => prefetchPageOnHover?.(currentPage - 1)}
        onMouseLeave={prefetchPageOnHover?.cancel}
        onFocus={() => prefetchPage(currentPage - 1)}
        $size="sm"
        disabled={currentPage === 1}
      />
      {pageNumbers.map((page, idx) => {
        if (page === 'ellipsis') {
          return <EllipsisIcon key={`ellipsis-${idx}`} width={14} />
        }

        return (
          <PageSelectButton
            type="button"
            key={`pageSelectBtn-${page}`}
            onMouseEnter={() => prefetchPageOnHover?.(page)}
            onMouseLeave={prefetchPageOnHover?.cancel}
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
        onMouseEnter={() => prefetchPageOnHover?.(currentPage + 1)}
        onMouseLeave={prefetchPageOnHover?.cancel}
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
        onMouseEnter={() => prefetchPageOnHover?.(totalPages)}
        onMouseLeave={prefetchPageOnHover?.cancel}
        onFocus={() => prefetchPage(totalPages)}
        $size="sm"
        $flipH
        disabled={currentPage === totalPages}
      />
    </StyledPagination>
  )
}
