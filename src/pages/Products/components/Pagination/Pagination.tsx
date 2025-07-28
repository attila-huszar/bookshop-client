import { StyledPagination, PageSelectButton } from './Pagination.style'
import { IconButton } from '@/components'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  booksSelector,
  incrementBooksCurrentPage,
  decrementBooksCurrentPage,
  fetchBooks,
  setBooksCurrentPage,
} from '@/store'
import { ChevronLeftIcon, ChevronLeftEndIcon, EllipsisIcon } from '@/assets/svg'

export function Pagination() {
  const dispatch = useAppDispatch()
  const { booksCurrentPage, booksTotal, booksPerPage, booksFilters } =
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
            void dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftEndIcon />}
        title="First Page"
        $size="sm"
        disabled={booksCurrentPage === 1}
      />
      <IconButton
        onClick={() => {
          if (booksCurrentPage > 1) {
            dispatch(decrementBooksCurrentPage())
            void dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftIcon />}
        title="Previous Page"
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
              void dispatch(fetchBooks(booksFilters.active))
            }}
            disabled={booksCurrentPage === page}
            aria-label={`Page ${page}`}>
            {page}
          </PageSelectButton>
        )
      })}
      <IconButton
        onClick={() => {
          if (booksCurrentPage < booksTotal / booksPerPage) {
            dispatch(incrementBooksCurrentPage())
            void dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftIcon />}
        title="Next Page"
        $size="sm"
        $flipH
        disabled={booksCurrentPage === Math.ceil(booksTotal / booksPerPage)}
      />
      <IconButton
        onClick={() => {
          if (booksCurrentPage < booksTotal / booksPerPage) {
            dispatch(setBooksCurrentPage(Math.ceil(booksTotal / booksPerPage)))
            void dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftEndIcon />}
        title="Last Page"
        $size="sm"
        $flipH
        disabled={booksCurrentPage === Math.ceil(booksTotal / booksPerPage)}
      />
    </StyledPagination>
  )
}
