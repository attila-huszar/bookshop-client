import { act } from 'react'
import { Provider } from 'react-redux'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { booksQueryArgs } from '@/store/selectors'
import {
  applyBooksFilters,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import { Filter } from './Filter'

describe('Filter', () => {
  let store: ReturnType<typeof createAppStore>

  beforeEach(async () => {
    store = createAppStore()
    await store.dispatch(
      booksApi.util.upsertQueryData('searchOptions', undefined, {
        genre: ['Fiction', 'Non-Fiction'],
        price: [0, 100],
        publishYear: [1900, 2020],
      }),
    )
    store.dispatch(setBooksFilterPrice([10, 50]))
    store.dispatch(setBooksFilterPublishYear([1990, 2020]))
    store.dispatch(setBooksFilterRating(3.5))
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
    vi.restoreAllMocks()
  })

  const renderFilter = () =>
    render(
      <Provider store={store}>
        <Filter />
      </Provider>,
    )

  it('renders the filter form with all inputs', () => {
    renderFilter()

    expect(screen.getByText(/genre/i)).toBeInTheDocument()
    expect(screen.getByText(/^price$/i)).toBeInTheDocument()
    expect(screen.getByText(/^discount$/i)).toBeInTheDocument()
    expect(screen.getByText(/publication year/i)).toBeInTheDocument()
    expect(screen.getByText(/rating/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('waits quietly for filter options and displays controls when they arrive', async () => {
    let completeRequest!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => response,
      }),
    )
    store.dispatch(bookshopApi.util.resetApiState())
    renderFilter()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /submit/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()

    act(() => {
      completeRequest(
        Response.json({
          genre: ['Fiction', 'Non-Fiction'],
          price: [0, 100],
          publishYear: [1900, 2020],
        }),
      )
    })

    expect(
      await screen.findByRole('button', { name: /submit/i }),
    ).toBeInTheDocument()
    expect(publicApi.baseRequest).toHaveBeenCalledOnce()
  })

  it('keeps draft filters separate until submission updates the query arguments', async () => {
    renderFilter()

    await userEvent.click(screen.getByLabelText(/^fiction$/i))
    const starButton = screen.getAllByRole('button', { name: /rating/i })[2]

    if (!starButton) {
      throw new Error('Star button not found')
    }

    await userEvent.click(starButton)
    expect(booksQueryArgs(store.getState()).criteria).toBeUndefined()

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(booksQueryArgs(store.getState())).toEqual({
        currentPage: 1,
        itemsPerPage: 8,
        criteria: {
          genre: ['Fiction'],
          discountPrice_gte: 10,
          discountPrice_lte: 50,
          publishYear_gte: 1990,
          rating_gte: 2.5,
        },
      })
    })
  })

  it('resets the draft and applied filters together', async () => {
    store.dispatch(
      applyBooksFilters(store.getState().books.booksFilters.active),
    )
    renderFilter()

    await userEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(booksQueryArgs(store.getState()).criteria).toBeUndefined()
    expect(store.getState().books.booksFilters.active).toEqual({
      ...store.getState().books.booksFilters.initial,
      genre: [],
    })
  })
})
