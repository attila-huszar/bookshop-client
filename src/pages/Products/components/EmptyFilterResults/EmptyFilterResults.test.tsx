import { Provider } from 'react-redux'
import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { booksQueryArgs } from '@/store/selectors'
import {
  applyBooksFilters,
  setBooksCurrentPage,
  setBooksFilterDiscount,
  setBooksFilterGenre,
  setBooksFilterPrice,
  setBooksFilterPublishYear,
  setBooksFilterRating,
} from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import { EmptyFilterResults } from './EmptyFilterResults'

describe('EmptyFilterResults', () => {
  let store: ReturnType<typeof createAppStore>

  beforeEach(() => {
    store = createAppStore()
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
  })

  const renderEmptyResults = () =>
    render(
      <Provider store={store}>
        <EmptyFilterResults />
      </Provider>,
    )

  it('should render the component with icon, message, and reset button', () => {
    renderEmptyResults()

    expect(
      screen.getByText(/sorry, no results match your filter criteria/i),
    ).toBeInTheDocument()

    expect(
      screen.getByRole('button', { name: /reset filters/i }),
    ).toBeInTheDocument()

    expect(screen.getByRole('img', { name: /no results/i })).toBeInTheDocument()
  })

  it('clears applied and draft filters and returns to the first page', async () => {
    await store.dispatch(
      booksApi.util.upsertQueryData('searchOptions', undefined, {
        genre: ['Fiction'],
        price: [0, 100],
        publishYear: [1900, 2026],
      }),
    )
    store.dispatch(setBooksFilterGenre('Fiction'))
    store.dispatch(setBooksFilterPrice([10, 20]))
    store.dispatch(setBooksFilterPublishYear([2000, 2020]))
    store.dispatch(setBooksFilterDiscount('discountOnly'))
    store.dispatch(setBooksFilterRating(4.5))
    store.dispatch(
      applyBooksFilters(store.getState().books.booksFilters.active),
    )
    store.dispatch(setBooksCurrentPage(3))
    renderEmptyResults()

    const resetButton = screen.getByRole('button', { name: /reset filters/i })
    await userEvent.click(resetButton)

    expect(booksQueryArgs(store.getState()).criteria).toBeUndefined()
    expect(store.getState().books.booksCurrentPage).toBe(1)
    expect(store.getState().books.booksFilters.active).toEqual({
      genre: [],
      price: [0, 100],
      publishYear: [1900, 2026],
      discount: 'allBooks',
      rating: 0.5,
    })
  })
})
