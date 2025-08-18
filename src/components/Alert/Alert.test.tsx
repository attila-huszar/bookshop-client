import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Error Component', () => {
  it('should display the error text correctly', () => {
    render(<Alert message="An error occurred" error="Detailed error message" />)

    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    expect(screen.getByText(/detailed error message/i)).toBeInTheDocument()
  })

  it('should not render error message if not provided', () => {
    render(<Alert message="An error occurred" />)

    expect(screen.getByText(/an error occurred/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/detailed error message/i),
    ).not.toBeInTheDocument()
  })
})
