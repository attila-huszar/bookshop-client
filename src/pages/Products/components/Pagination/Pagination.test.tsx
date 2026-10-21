import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import {
  decrementBooksCurrentPage,
  incrementBooksCurrentPage,
  setBooksCurrentPage,
} from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { Pagination } from './Pagination'

vi.mock('@/hooks/redux', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe('Pagination', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    const initialState = createAppStore().getState()
    vi.mocked(useAppSelector).mockImplementation((selector) =>
      selector({
        ...initialState,
        books: {
          ...initialState.books,
          booksCurrentPage: 2,
          booksPerPage: 10,
        },
      }),
    )
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render pagination controls', () => {
    render(<Pagination total={100} />)

    expect(screen.getByRole('button', { name: /Page 1$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Page 10/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button').length).toBeGreaterThan(2)
  })

  it('should dispatch actions for the first page button click', async () => {
    render(<Pagination total={100} />)

    const firstPageButton = screen.getAllByRole('button')[2]
    if (!firstPageButton) throw new Error('First page button not found')
    await userEvent.click(firstPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(1))
    })
  })

  it('should dispatch decrement action when clicking on the previous page button', async () => {
    render(<Pagination total={100} />)

    const previousPageButton = screen.getByRole('button', { name: /previous/i })
    await userEvent.click(previousPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(decrementBooksCurrentPage())
    })
  })

  it('should dispatch set current page action when a page button is clicked', async () => {
    render(<Pagination total={100} />)

    const pageButton = screen.getByRole('button', { name: 'Page 3' })
    await userEvent.click(pageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(3))
    })
  })

  it('should dispatch increment action when clicking on the next page button', async () => {
    render(<Pagination total={100} />)

    const nextPageButton = screen.getByRole('button', { name: /next/i })
    await userEvent.click(nextPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(incrementBooksCurrentPage())
    })
  })

  it('should dispatch actions for the last page button click', async () => {
    render(<Pagination total={100} />)

    const lastPageButton =
      screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
    if (!lastPageButton) throw new Error('Last page button not found')
    await userEvent.click(lastPageButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(10))
    })
  })
})
