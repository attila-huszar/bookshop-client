import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Filter } from './Filter'
import { useAppDispatch, useAppSelector } from '@/hooks'
import {
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterDiscount,
  setBooksFilterPublishYear,
  setBooksFilterRating,
  setBooksCurrentPage,
  fetchBooks,
} from '@/store'

vi.mock('@/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

vi.mock('@/store', () => ({
  booksSelector: vi.fn(),
  setBooksFilterGenre: vi.fn(),
  setBooksFilterPrice: vi.fn(),
  setBooksFilterDiscount: vi.fn(),
  setBooksFilterPublishYear: vi.fn(),
  setBooksFilterRating: vi.fn(),
  setBooksCurrentPage: vi.fn(),
  fetchBooks: vi.fn(),
}))

describe('Filter', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useAppSelector).mockReturnValue({
      booksFilters: {
        active: {
          genre: [],
          price: [10, 50],
          discount: 'allBooks',
          publishYear: [1990, 2020],
          rating: 3.5,
        },
        initial: {
          genre: ['Fiction', 'Non-Fiction'],
          price: [0, 100],
          publishYear: [1900, 2020],
        },
      },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the filter form with all inputs', () => {
    render(<Filter />)

    expect(screen.getByText(/genre/i)).toBeInTheDocument()
    expect(screen.getByText(/^price$/i)).toBeInTheDocument()
    expect(screen.getByText(/^discount$/i)).toBeInTheDocument()
    expect(screen.getByText(/publication year/i)).toBeInTheDocument()
    expect(screen.getByText(/rating/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('should dispatch the correct action on form submission', async () => {
    render(<Filter />)

    const fictionCheckbox = screen.getByLabelText(/^fiction$/i)
    await userEvent.click(fictionCheckbox)

    const starButton = screen.getAllByRole('button', { name: /rating/i })[2]
    if (!starButton) throw new Error('Star button not found')
    await userEvent.click(starButton)

    const submitButton = screen.getByRole('button', { name: /submit/i })
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(1))

      expect(mockDispatch).toHaveBeenCalledWith(
        setBooksFilterGenre(['Fiction']),
      )

      expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterRating(2.5))

      expect(mockDispatch).toHaveBeenCalledWith(
        fetchBooks({
          genre: ['Fiction'],
          price: [10, 50],
          discount: 'allBooks',
          publishYear: [1990, 2020],
          rating: 3.5,
        }),
      )
    })
  })

  it('should reset the filters when reset button is clicked', async () => {
    render(<Filter />)

    const resetButton = screen.getByRole('button', { name: /reset/i })
    await userEvent.click(resetButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks())
      expect(mockDispatch).toHaveBeenCalledWith(setBooksCurrentPage(1))
      expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterGenre([]))
      expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterPrice([]))
      expect(mockDispatch).toHaveBeenCalledWith(
        setBooksFilterDiscount('allBooks'),
      )
      expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterPublishYear([]))
      expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterRating(0.5))
    })
  })
})
