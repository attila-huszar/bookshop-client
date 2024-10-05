import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthorizationMenu } from './AuthorizationMenu'
import { PATH } from '@/constants'

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
      `/${PATH.login}`,
    )
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
      'href',
      `/${PATH.registration}`,
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
