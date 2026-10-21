import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ROUTE } from '@/routes/route'
import { Menu } from './Menu'

describe('Menu component', () => {
  it('should render the menu button', () => {
    render(<Menu />, { wrapper: MemoryRouter })

    const button = screen.getByTitle('Menu')
    expect(button).toBeInTheDocument()
  })

  it.each([
    { link: 'Home', initialPath: `/${ROUTE.BOOKS}`, destination: 'Home page' },
    { link: 'Shop', initialPath: '/', destination: 'Book catalogue' },
  ])(
    'navigates to $link when its link is clicked',
    async ({ link, initialPath, destination }) => {
      render(
        <MemoryRouter initialEntries={[initialPath]}>
          <Menu />
          <Routes>
            <Route path="/" element={<p>Home page</p>} />
            <Route path={`/${ROUTE.BOOKS}`} element={<p>Book catalogue</p>} />
          </Routes>
        </MemoryRouter>,
      )

      await userEvent.click(screen.getByTitle('Menu'))
      await userEvent.click(screen.getByRole('link', { name: link }))

      expect(await screen.findByText(destination)).toBeInTheDocument()
    },
  )
})
