import { useTranslation } from 'react-i18next'
import { booksSelector } from '@/store/selectors'
import {
  decrementBooksCurrentPage,
  incrementBooksCurrentPage,
  setBooksCurrentPage,
} from '@/store/slices/books'
import { IconButton } from '@/components/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { scrollToTop } from '@/helpers/scrollToTop'
import { CaretLeftEndIcon, CaretLeftIcon, EllipsisIcon } from '@/assets/svg'
import { PageSelectButton, StyledPagination } from './Pagination.style'

export function Pagination() {
  const { t } = useTranslation()

  const dispatch = useAppDispatch()
  const { booksCurrentPage, booksTotal, booksPerPage } =
    useAppSelector(booksSelector)

  const totalPages = Math.ceil(booksTotal / booksPerPage)
  const currentPage = booksCurrentPage

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

  const pageNumbers = getPageNumbers()

  return (
    <StyledPagination>
      <IconButton
        onClick={() => {
          if (booksCurrentPage > 1) {
            dispatch(setBooksCurrentPage(1))
            scrollToTop()
          }
        }}
        icon={<CaretLeftEndIcon />}
        title={t('pagination.first')}
        $size="sm"
        disabled={booksCurrentPage === 1}
      />
      <IconButton
        onClick={() => {
          if (booksCurrentPage > 1) {
            dispatch(decrementBooksCurrentPage())
            scrollToTop()
          }
        }}
        icon={<CaretLeftIcon />}
        title={t('pagination.previous')}
        $size="sm"
        disabled={booksCurrentPage === 1}
      />
      {pageNumbers.map((pageNumber, idx) => {
        if (pageNumber === 'ellipsis') {
          return <EllipsisIcon key={`ellipsis-${idx}`} width={14} />
        }

        const page = pageNumber as number
        return (
          <PageSelectButton
            key={`pageSelectBtn-${page}`}
            onClick={() => {
              dispatch(setBooksCurrentPage(page))
              scrollToTop()
            }}
            disabled={booksCurrentPage === page}
            aria-label={t('pagination.page', { page: page })}>
            {page}
          </PageSelectButton>
        )
      })}
      <IconButton
        onClick={() => {
          if (booksCurrentPage < booksTotal / booksPerPage) {
            dispatch(incrementBooksCurrentPage())
            scrollToTop()
          }
        }}
        icon={<CaretLeftIcon />}
        title={t('pagination.next')}
        $size="sm"
        $flipH
        disabled={booksCurrentPage === Math.ceil(booksTotal / booksPerPage)}
      />
      <IconButton
        onClick={() => {
          if (booksCurrentPage < booksTotal / booksPerPage) {
            dispatch(setBooksCurrentPage(Math.ceil(booksTotal / booksPerPage)))
            scrollToTop()
          }
        }}
        icon={<CaretLeftEndIcon />}
        title={t('pagination.last')}
        $size="sm"
        $flipH
        disabled={booksCurrentPage === Math.ceil(booksTotal / booksPerPage)}
      />
    </StyledPagination>
  )
}
