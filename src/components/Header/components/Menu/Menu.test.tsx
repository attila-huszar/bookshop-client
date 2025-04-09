import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Menu } from './Menu'
import { ROUTE } from '@/routes'
import { Providers } from '@/setupTests'

describe('Menu component', () => {
  it('should render the menu button', () => {
    render(<Menu />, { wrapper: Providers })

    const button = screen.getByTitle('Menu')
    expect(button).toBeInTheDocument()
  })

  it('should navigate to home page when clicking home link', async () => {
    render(<Menu />, { wrapper: Providers })

    const menuButton = screen.getByTitle('Menu')
    await userEvent.click(menuButton)

    const homeLink = screen.getByText('Home')
    await userEvent.click(homeLink)

    expect(global.window.location.pathname).toBe('/')
  })

  it('should navigate to shop page when clicking shop link', async () => {
    render(<Menu />, { wrapper: Providers })

    const menuButton = screen.getByTitle('Menu')
    await userEvent.click(menuButton)

    const shopLink = screen.getByText('Shop')
    await userEvent.click(shopLink)

    expect(global.window.location.pathname).toContain(ROUTE.BOOKS)
  })
})
