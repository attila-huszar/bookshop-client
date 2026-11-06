import { Providers } from '@/testUtils'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

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
