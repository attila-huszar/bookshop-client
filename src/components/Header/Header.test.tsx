import { Providers } from '@/setupTests'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { Header } from './Header'

vi.mock('./components', () => ({
  Menu: () => <div>Shop</div>,
  Search: () => <div>Search</div>,
  AccountMenu: () => <div>Login</div>,
  BasketButton: () => <div>Basket</div>,
}))

describe('Header Component', () => {
  it('should render all header components', () => {
    render(<Header />, { wrapper: Providers })

    expect(screen.getByText(/shop/i)).toBeInTheDocument()
    expect(screen.getByText(/search/i)).toBeInTheDocument()
    expect(screen.getByText(/login/i)).toBeInTheDocument()
    expect(screen.getByText(/basket/i)).toBeInTheDocument()
  })
})
