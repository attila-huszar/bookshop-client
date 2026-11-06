import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'
import { ROUTE } from '@/routes/route'
import { AuthorizationMenu } from './AuthorizationMenu'

describe('AuthorizationMenu', () => {
  const renderWithRouter = (children: React.ReactNode) => {
    return render(<MemoryRouter>{children}</MemoryRouter>)
  }

  it('renders authentication links and supplied content', () => {
    renderWithRouter(
      <AuthorizationMenu>
        <span>Additional action</span>
      </AuthorizationMenu>,
    )
    expect(screen.getByRole('link', { name: /login/i })).toHaveAttribute(
      'href',
      `/${ROUTE.LOGIN}`,
    )
    expect(screen.getByRole('link', { name: /register/i })).toHaveAttribute(
      'href',
      `/${ROUTE.REGISTER}`,
    )
    expect(screen.getByText('Additional action')).toBeInTheDocument()
  })
})
