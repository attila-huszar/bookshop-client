import { Providers } from '@/setupTests'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { useAppSelector } from '@/hooks'
import { Recommended } from './Recommended'

vi.mock('@/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components')>()
  return {
    ...actual,
    Card: ({ book }: { book: { title: string } }) => <div>{book.title}</div>,
    SwiperComponent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }
})

describe('Recommended Component', () => {
  it('should render recommended books', () => {
    const mockBooks = [
      { id: 1, title: 'Book One' },
      { id: 2, title: 'Book Two' },
    ]

    vi.mocked(useAppSelector).mockReturnValue({
      booksRecommended: mockBooks,
    })

    render(<Recommended />, { wrapper: Providers })

    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    expect(screen.getByText('Book One')).toBeInTheDocument()
    expect(screen.getByText('Book Two')).toBeInTheDocument()
  })

  it('should render nothing if there are no recommended books', () => {
    vi.mocked(useAppSelector).mockReturnValue({ booksRecommended: [] })

    render(<Recommended />, { wrapper: Providers })

    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    expect(screen.queryByText('Book One')).not.toBeInTheDocument()
    expect(screen.queryByText('Book Two')).not.toBeInTheDocument()
  })
})
