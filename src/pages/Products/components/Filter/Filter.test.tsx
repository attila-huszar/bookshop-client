import { act } from 'react'
import { Provider } from 'react-redux'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import {
  applyBooksFilters,
  booksQueryArgs,
  createAppStore,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { useAppSelector as realUseAppSelector } from '@/hooks/redux'
import { Filter } from './Filter'

describe('Filter', () => {
  let store: ReturnType<typeof createAppStore>

  beforeEach(async () => {
    store = createAppStore()
    await store.dispatch(
      bookshopApi.util.upsertQueryData('searchOptions', undefined, {
        genre: ['Fiction', 'Non-Fiction'],
        price: [0, 100],
        publishYear: [1900, 2020],
      }),
    )
    store.dispatch(setBooksFilterPrice([10, 50]))
    store.dispatch(setBooksFilterPublishYear([1990, 2020]))
    store.dispatch(setBooksFilterRating(3.5))
    vi.mocked(useAppDispatch).mockReturnValue(store.dispatch)
    vi.mocked(useAppSelector).mockImplementation(realUseAppSelector)
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
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

  it('waits quietly instead of showing draft controls when filter options are unavailable', () => {
    store.dispatch(bookshopApi.util.resetApiState())
    renderFilter()

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /submit/i }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument()
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
          priceMin: 10,
          priceMax: 50,
          discount: 'allBooks',
          publishYearMin: 1990,
          publishYearMax: null,
          rating: 2.5,
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
