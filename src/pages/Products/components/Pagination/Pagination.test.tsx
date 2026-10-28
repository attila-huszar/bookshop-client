import { Provider } from 'react-redux'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import * as publicApi from '@/api/baseRequest'
import { useBooksQuery } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { booksQueryArgs } from '@/store/selectors'
import { applyBooksFilters, setBooksCurrentPage } from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import { useAppSelector } from '@/hooks/redux'
import { CacheTime } from '@/constants/cacheTimes'
import { Pagination } from './Pagination'

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
  store.dispatch(setBooksCurrentPage(2))
  vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () =>
        Promise.resolve(
          Response.json([], { headers: { 'x-total-count': '80' } }),
        ),
    }),
  )
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

const renderPagination = (total = 80) =>
  render(
    <Provider store={store}>
      <Pagination total={total} />
    </Provider>,
  )

describe('Pagination', () => {
  it.each([
    { button: 'First Page', page: 1 },
    { button: 'Previous Page', page: 1 },
    { button: 'Page 3', page: 3 },
    { button: 'Next Page', page: 3 },
    { button: 'Last Page', page: 10 },
  ])('selects page $page using $button', async ({ button, page }) => {
    renderPagination()
    await userEvent.click(screen.getByRole('button', { name: button }))

    expect(store.getState().books.booksCurrentPage).toBe(page)
  })

  it('prefetches only the intended page with current filters and reuses it on mount', async () => {
    store.dispatch(
      applyBooksFilters({
        genre: ['Fiction'],
        price: [],
        publishYear: [],
        discount: 'allBooks',
        rating: 0.5,
      }),
    )
    store.dispatch(setBooksCurrentPage(2))
    const view = renderPagination()

    expect(publicApi.baseRequest).not.toHaveBeenCalled()
    const next = screen.getByRole('button', { name: 'Next Page' })
    fireEvent.mouseEnter(next)
    await waitFor(() => expect(publicApi.baseRequest).toHaveBeenCalledTimes(1))
    await act(async () => {
      await Promise.all(
        store.dispatch(bookshopApi.util.getRunningQueriesThunk()),
      )
    })
    fireEvent.focus(next)
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
    expect(publicApi.baseRequest).toHaveBeenCalledWith(
      'books',
      expect.objectContaining({
        searchParams: new URLSearchParams({
          page: '3',
          limit: '8',
          genre: 'Fiction',
        }),
      }),
    )
    expect(store.getState().books.booksCurrentPage).toBe(2)
    view.unmount()

    function Page() {
      const args = useAppSelector(booksQueryArgs)
      const { data } = useBooksQuery(args, {
        refetchOnMountOrArgChange: CacheTime.FiveMinutes,
      })
      return <p>{data?.total}</p>
    }
    store.dispatch(setBooksCurrentPage(3))
    render(
      <Provider store={store}>
        <Page />
      </Provider>,
    )

    expect(await screen.findByText('80')).toBeInTheDocument()
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(1)
  })

  it('does not prefetch disabled controls or an out-of-range page', () => {
    store.dispatch(setBooksCurrentPage(1))
    renderPagination(8)
    for (const button of screen.getAllByRole('button')) {
      expect(button).toBeDisabled()
      fireEvent.mouseEnter(button)
      fireEvent.focus(button)
    }

    expect(publicApi.baseRequest).not.toHaveBeenCalled()
  })
})
