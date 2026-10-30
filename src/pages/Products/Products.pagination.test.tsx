import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import * as publicApi from '@/api/baseRequest'
import { booksApi, useBooksQuery } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { booksQueryArgs } from '@/store/selectors'
import { applyBooksFilters, setBooksCurrentPage } from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import { useAppSelector } from '@/hooks/redux'
import { CacheTime } from '@/constants/cacheTimes'
import type { Book } from '@/types'
import { Products } from './Products'

vi.mock('@/components/Card', () => ({
  Card: ({ book }: { book: Book }) => <p>{book.title}</p>,
}))

const book: Book = {
  id: 1,
  title: 'Cached book',
  author: null,
  genre: 'Fiction',
  imgUrl: '',
  description: '',
  publishYear: 2026,
  rating: 4,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}

let store: ReturnType<typeof createAppStore>

beforeEach(async () => {
  store = createAppStore()
  await store.dispatch(
    booksApi.util.upsertQueryData('searchOptions', undefined, {
      genre: ['Fiction'],
      price: [0, 100],
      publishYear: [1900, 2026],
    }),
  )
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

const renderPagination = async (total = 80) => {
  await store.dispatch(
    booksApi.util.upsertQueryData('books', booksQueryArgs(store.getState()), {
      books: [book],
      total,
    }),
  )

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    </Provider>,
  )
}

describe('shop pagination', () => {
  it.each([
    { button: 'First Page', page: 1 },
    { button: 'Previous Page', page: 1 },
    { button: 'Page 3', page: 3 },
    { button: 'Next Page', page: 3 },
    { button: 'Last Page', page: 10 },
  ])('selects page $page using $button', async ({ button, page }) => {
    await renderPagination()
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
    const view = await renderPagination()

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

  it('does not prefetch disabled controls or an out-of-range page', async () => {
    store.dispatch(setBooksCurrentPage(1))
    await renderPagination(8)
    const pagination = screen.getByRole('navigation')
    for (const button of within(pagination).getAllByRole('button')) {
      expect(button).toBeDisabled()
      fireEvent.mouseEnter(button)
      fireEvent.focus(button)
    }

    expect(publicApi.baseRequest).not.toHaveBeenCalled()
  })
})
