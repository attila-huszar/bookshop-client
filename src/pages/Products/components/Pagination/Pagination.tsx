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
import { ChevronLeftIcon, ChevronLeftEndIcon } from '@/assets/svg'

export function Pagination() {
  const dispatch = useAppDispatch()
  const { booksCurrentPage, booksTotal, booksPerPage, booksFilters } =
    useAppSelector(booksSelector)

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
      {Array.from(
        { length: Math.ceil(booksTotal / booksPerPage) },
        (_, idx) => {
          return (
            <PageSelectButton
              key={`pageSelectBtn-${idx}`}
              onClick={() => {
                dispatch(setBooksCurrentPage(idx + 1))
                void dispatch(fetchBooks(booksFilters.active))
              }}
              disabled={booksCurrentPage === idx + 1}
              aria-label={`Page ${idx + 1}`}>
              {idx + 1}
            </PageSelectButton>
          )
        },
      )}
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
