import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import * as publicApi from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { setBooksCurrentPage } from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import { CacheTime } from '@/constants/time'
import { Menu } from './Menu'

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
  vi.spyOn(publicApi, 'baseRequest').mockImplementation((path) =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () =>
        Promise.resolve(
          Response.json(
            path === 'books'
              ? []
              : { genre: [], price: [0, 100], publishYear: [1900, 2026] },
          ),
        ),
    }),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

const renderMenu = (path = '/') =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Menu />
        <Routes>
          <Route path="/" element={<p>Home page</p>} />
          <Route path="/books" element={<p>Book catalogue</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  )

describe('Menu', () => {
  it('keeps the closed mobile menu hidden and follows the native dialog close event', async () => {
    vi.stubGlobal('innerWidth', 390)
    renderMenu()
    const user = userEvent.setup()
    const trigger = screen.getByRole('button', { name: 'Menu' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Shop' })).not.toBeInTheDocument()
    await user.tab()
    expect(trigger).toHaveFocus()
    await user.keyboard('{Enter}')

    const dialog = screen.getByRole('dialog', { name: 'Menu' })
    expect(dialog).toHaveAttribute('open')
    expect(trigger).toHaveAttribute('aria-controls', dialog.id)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    // jsdom needs the native close event to be dispatched explicitly.
    dialog.removeAttribute('open')
    fireEvent(dialog, new Event('close'))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    await user.click(trigger)
    await user.click(screen.getByRole('button', { name: 'Close menu' }))
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the menu without prefetching catalogue data', () => {
    renderMenu()
    expect(screen.getByTitle('Menu')).toBeInTheDocument()
    expect(publicApi.baseRequest).not.toHaveBeenCalled()
  })

  it.each([
    { link: 'Home', path: '/books', destination: 'Home page' },
    { link: 'Shop', path: '/', destination: 'Book catalogue' },
  ])('navigates to $link', async ({ link, path, destination }) => {
    renderMenu(path)
    await userEvent.click(screen.getByTitle('Menu'))
    await userEvent.click(screen.getByRole('link', { name: link }))
    expect(await screen.findByText(destination)).toBeInTheDocument()
  })

  it('warms only Shop data on intent and refreshes only stale entries', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    store.dispatch(setBooksCurrentPage(3))
    renderMenu()
    await userEvent.click(screen.getByTitle('Menu'))
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Home' }))
    expect(publicApi.baseRequest).not.toHaveBeenCalled()

    const shop = screen.getByRole('link', { name: 'Shop' })
    fireEvent.focus(shop)
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(2)
    expect(publicApi.baseRequest).toHaveBeenCalledWith(
      'books',
      expect.objectContaining({
        searchParams: new URLSearchParams({ page: '3', limit: '8' }),
      }),
    )

    fireEvent.mouseEnter(shop)
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(2)
    vi.setSystemTime(Date.now() + (CacheTime.FiveMinutes + 1) * 1_000)
    fireEvent.mouseEnter(shop)
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(3)
  })
})
