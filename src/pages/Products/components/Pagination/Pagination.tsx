import { StyledPagination, PageSelectButton } from './Pagination.styles'
import { IconButton } from 'components'
import { useAppDispatch, useAppSelector } from 'hooks'
import {
  booksSelector,
  incrementBooksCurrentPage,
  decrementBooksCurrentPage,
  fetchBooks,
  setBooksCurrentPage,
} from 'store'
import ChevronLeftIcon from 'assets/svg/chevron_left.svg?react'
import ChevronLeftEndIcon from 'assets/svg/chevron_left_end.svg?react'

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
            dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftEndIcon />}
        disabled={booksCurrentPage === 1}
      />
      <IconButton
        onClick={() => {
          if (booksCurrentPage > 1) {
            dispatch(decrementBooksCurrentPage())
            dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftIcon />}
        disabled={booksCurrentPage === 1}
      />
      {Array.from(
        { length: Math.ceil(booksTotal / booksPerPage) },
        (_, idx) => {
          return (
            <PageSelectButton
              key={`pageSelectBtn-${idx}`}
              data-active={booksCurrentPage === idx + 1}
              onClick={() => {
                dispatch(setBooksCurrentPage(idx + 1))
                dispatch(fetchBooks(booksFilters.active))
              }}>
              {idx + 1}
            </PageSelectButton>
          )
        },
      )}
      <IconButton
        onClick={() => {
          if (booksCurrentPage < booksTotal / booksPerPage) {
            dispatch(incrementBooksCurrentPage())
            dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftIcon />}
        disabled={booksCurrentPage === Math.ceil(booksTotal / booksPerPage)}
        $flipHorizontal
      />
      <IconButton
        onClick={() => {
          if (booksCurrentPage < booksTotal / booksPerPage) {
            dispatch(setBooksCurrentPage(Math.ceil(booksTotal / booksPerPage)))
            dispatch(fetchBooks(booksFilters.active))
          }
        }}
        icon={<ChevronLeftEndIcon />}
        disabled={booksCurrentPage === Math.ceil(booksTotal / booksPerPage)}
        $flipHorizontal
      />
    </StyledPagination>
  )
}
