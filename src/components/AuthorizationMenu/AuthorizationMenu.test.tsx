import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthorizationMenu } from './AuthorizationMenu'
import { ROUTE } from '@/routes'

describe('AuthorizationMenu', () => {
  const renderWithRouter = (children: React.ReactNode) => {
    return render(<MemoryRouter>{children}</MemoryRouter>)
  }

  it('should render login and register links', () => {
    renderWithRouter(<AuthorizationMenu />)
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('should have correct hrefs for login and register links', () => {
    renderWithRouter(<AuthorizationMenu />)
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute(
      'href',
      `/${ROUTE.LOGIN}`,
    )
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
      'href',
      `/${ROUTE.REGISTER}`,
    )
  })

  it('should render children passed to the component', () => {
    renderWithRouter(
      <AuthorizationMenu>
        <div data-testid="child-element">Child Content</div>
      </AuthorizationMenu>,
    )
    expect(screen.getByTestId('child-element')).toBeInTheDocument()
    expect(screen.getByText('Child Content')).toBeInTheDocument()
  })
})
