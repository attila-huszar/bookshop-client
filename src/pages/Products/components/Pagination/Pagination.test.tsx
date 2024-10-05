import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Pagination } from './Pagination'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  setBooksCurrentPage,
  decrementBooksCurrentPage,
  incrementBooksCurrentPage,
  fetchBooks,
} from '@/store'
import { IFilter } from '@/interfaces'

vi.mock('@/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('@/store', () => ({
  booksSelector: vi.fn(),
  setBooksCurrentPage: vi.fn(),
  decrementBooksCurrentPage: vi.fn(),
  incrementBooksCurrentPage: vi.fn(),
  fetchBooks: vi.fn(),
}))

describe('Pagination', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useAppSelector).mockReturnValue({
      booksCurrentPage: 2,
      booksTotal: 100,
      booksPerPage: 10,
      booksFilters: { active: {} },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render pagination controls', () => {
    render(<Pagination />)

    expect(screen.getByRole('button', { name: /Page 1$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Page 10/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBeGreaterThan(2)
  })

  it('should dispatch actions for the first page button click', async () => {
    render(<Pagination />)

    const firstPageButton = screen.getAllByRole('button')[2]
    await userEvent.click(firstPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(1))
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks({} as IFilter))
    })
  })

  it('should dispatch decrement action when clicking on the previous page button', async () => {
    render(<Pagination />)

    const previousPageButton = screen.getByRole('button', { name: /previous/i })
    await userEvent.click(previousPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(decrementBooksCurrentPage())
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks({} as IFilter))
    })
  })

  it('should dispatch set current page action when a page button is clicked', async () => {
    render(<Pagination />)

    const pageButton = screen.getByRole('button', { name: 'Page 3' })
    await userEvent.click(pageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(3))
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks({} as IFilter))
    })
  })

  it('should dispatch increment action when clicking on the next page button', async () => {
    render(<Pagination />)

    const nextPageButton = screen.getByRole('button', { name: /next/i })
    await userEvent.click(nextPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(incrementBooksCurrentPage())
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks({} as IFilter))
    })
  })

  it('should dispatch actions for the last page button click', async () => {
    render(<Pagination />)

    const lastPageButton =
      screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
    await userEvent.click(lastPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(10))
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks({} as IFilter))
    })
  })
})
