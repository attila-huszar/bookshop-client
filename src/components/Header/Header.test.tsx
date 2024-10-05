import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'
import { Providers } from '@/setupTests'

vi.mock('./components', () => ({
  Menu: () => <div>Shop</div>,
  Search: () => <div>Search</div>,
  Favorite: () => <div>Favorite</div>,
  AccountMenu: () => <div>Login</div>,
  BasketButton: () => <div>Basket</div>,
}))

describe('Header Component', () => {
  it('should render all header components', () => {
    render(<Header />, { wrapper: Providers })

    expect(screen.getByText(/shop/i)).toBeInTheDocument()
    expect(screen.getByText(/search/i)).toBeInTheDocument()
    expect(screen.getByText(/favorite/i)).toBeInTheDocument()
    expect(screen.getByText(/login/i)).toBeInTheDocument()
    expect(screen.getByText(/basket/i)).toBeInTheDocument()
  })
})
