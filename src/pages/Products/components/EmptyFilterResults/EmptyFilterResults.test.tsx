import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import {
  fetchBooks,
  setBooksFilterDiscount,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store'
import { useAppDispatch } from '@/hooks'
import { EmptyFilterResults } from './EmptyFilterResults'

vi.mock('@/hooks', () => ({
  useAppDispatch: vi.fn(),
}))

vi.mock('@/store', () => ({
  fetchBooks: vi.fn(),
  setBooksFilterGenre: vi.fn(),
  setBooksFilterPrice: vi.fn(),
  setBooksFilterDiscount: vi.fn(),
  setBooksFilterPublishYear: vi.fn(),
  setBooksFilterRating: vi.fn(),
}))

describe('EmptyFilterResults', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the component with icon, message, and reset button', () => {
    render(<EmptyFilterResults />)

    expect(
      screen.getByText(/sorry, no results match your filter criteria/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /reset filters/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('img', { name: /no results/i })).toBeInTheDocument()
  })

  it('should dispatch reset actions when the "Reset Filters" button is clicked', async () => {
    render(<EmptyFilterResults />)

    const resetButton = screen.getByRole('button', { name: /reset filters/i })
    await userEvent.click(resetButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(fetchBooks())
    })
    expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterGenre([]))
    expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterPrice([]))
    expect(mockDispatch).toHaveBeenCalledWith(
      setBooksFilterDiscount('allBooks'),
    )
    expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterPublishYear([]))
    expect(mockDispatch).toHaveBeenCalledWith(setBooksFilterRating(0.5))
  })
})
