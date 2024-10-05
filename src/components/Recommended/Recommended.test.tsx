import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Recommended } from './Recommended'
import { useAppSelector } from '@/hooks'

vi.mock('@/components', () => ({
  Card: ({ book }: { book: { title: string } }) => <div>{book.title}</div>,
  SwiperComponent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

describe('Recommended Component', () => {
  it('should render recommended books', () => {
    const mockBooks = [
      { id: 1, title: 'Book One' },
      { id: 2, title: 'Book Two' },
    ]

    vi.mocked(useAppSelector).mockReturnValue({
      booksRecommended: mockBooks,
    })

    render(<Recommended />)

    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    expect(screen.getByText('Book One')).toBeInTheDocument()
    expect(screen.getByText('Book Two')).toBeInTheDocument()
  })

  it('should render nothing if there are no recommended books', () => {
    vi.mocked(useAppSelector).mockReturnValue({ booksRecommended: [] })

    render(<Recommended />)

    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    expect(screen.queryByText('Book One')).not.toBeInTheDocument()
    expect(screen.queryByText('Book Two')).not.toBeInTheDocument()
  })
})
