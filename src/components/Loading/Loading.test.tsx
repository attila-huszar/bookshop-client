import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading Component', () => {
  it('should display the default loading text', () => {
    render(<Loading />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should display custom loading text when provided', () => {
    render(<Loading text="Please wait..." />)

    expect(screen.getByText(/please wait.../i)).toBeInTheDocument()
  })
})
