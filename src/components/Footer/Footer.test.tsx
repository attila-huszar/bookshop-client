import { Providers } from '@/setupTests'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Footer } from './Footer'

vi.mock(import('./components'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
  }
})

describe('Footer Component', () => {
  it('should render Navigation, Subscribe, and Links components', () => {
    render(<Footer />, { wrapper: Providers })

    expect(screen.getByText(/about/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /subscribe/i }),
    ).toBeInTheDocument()
    expect(screen.getByAltText(/google/i)).toBeInTheDocument()
  })
})
