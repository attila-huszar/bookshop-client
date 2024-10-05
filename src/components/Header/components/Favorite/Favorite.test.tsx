import { render, screen } from '@testing-library/react'
import { Favorite } from './Favorite'

describe('Favorite', () => {
  it('should render the Favorite button', () => {
    render(<Favorite />)

    const button = screen.getByTitle(/favorite/i)
    expect(button).toBeInTheDocument()
  })
})
