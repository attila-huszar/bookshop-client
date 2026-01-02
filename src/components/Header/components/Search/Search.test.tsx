import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useNavigate } from 'react-router'
import { Search } from './Search'
import { fetchBooksBySearch, fetchAuthorsBySearch } from '@/store'
import { useAppDispatch, useAppSelector, useDebounce } from '@/hooks'
import { Providers } from '@/setupTests'

vi.mock('@/store', () => ({
  authorsSelector: vi.fn(),
  fetchBooksBySearch: vi.fn(),
  fetchAuthorsBySearch: vi.fn(),
  fetchBooksByAuthor: vi.fn(),
}))

describe('Search', () => {
  const mockNavigate = vi.fn()

  it('should render the Search component and handle input changes', async () => {
    const mockDispatch = {
      payload: [{ id: 1, title: 'Test Title', author: 1, imgUrl: 'test.jpg' }],
    }

    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAppSelector).mockReturnValue({ authorArray: [] })
    vi.mocked(useDebounce).mockImplementation((fn) => fn)
    vi.mocked(useAppDispatch).mockReturnValue(
      vi.fn().mockReturnValue(mockDispatch),
    )

    render(<Search />, { wrapper: Providers })

    const input = screen.getByRole('textbox', { name: 'search' })
    await userEvent.type(input, 'Test')

    await waitFor(() => {
      expect(vi.mocked(fetchBooksBySearch)).toHaveBeenCalledWith('Test')
      expect(vi.mocked(fetchAuthorsBySearch)).toHaveBeenCalledWith('Test')
    })

    const button = screen.getByTitle(/search/i)
    await userEvent.click(button)

    const searchResult = screen.getByText('Test Title')
    await userEvent.click(searchResult)

    expect(mockNavigate).toHaveBeenCalledWith('/book?id=1')
  })
})
