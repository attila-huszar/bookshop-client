import { render, screen } from '@testing-library/react'
import { Loading } from './Loading'

describe('Loading Component', () => {
  it('shows the default message and accepts a custom message', () => {
    const { rerender } = render(<Loading />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    rerender(<Loading message="Please wait..." />)

    expect(screen.getByText(/please wait.../i)).toBeInTheDocument()
  })
})
