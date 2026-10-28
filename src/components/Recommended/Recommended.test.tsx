import { Provider } from 'react-redux'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import type { Book } from '@/types'
import { Recommended } from './Recommended'

vi.mock('@/components/Card', () => ({
  Card: ({ book }: { book: { title: string } }) => <div>{book.title}</div>,
}))

vi.mock('@/components/SwiperComponent', () => ({
  SwiperComponent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

const book: Book = {
  id: 1,
  title: 'Book One',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: '',
  description: 'A book',
  publishYear: 2024,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}
let store: ReturnType<typeof createAppStore>
let recommendations: Book[]
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
  store = createAppStore()
  recommendations = [book, { ...book, id: 2, title: 'Book Two' }]
  fetchMock = vi.fn<typeof fetch>().mockImplementation(() =>
    Promise.resolve(
      new Response(JSON.stringify(recommendations), {
        headers: { 'content-type': 'application/json' },
      }),
    ),
  )
  vi.stubGlobal('fetch', fetchMock)
  const client = publicApi.baseRequest.extend({
    prefix: 'https://bookshop.test/api',
    retry: 0,
  })

  vi.spyOn(publicApi, 'baseRequest').mockImplementation(client)
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

const renderRecommendations = () =>
  render(
    <Provider store={store}>
      <Recommended />
    </Provider>,
  )

const finishRequest = () =>
  act(async () => {
    await store
      .dispatch(
        booksApi.endpoints.booksByProperty.initiate('recommended', {
          subscribe: false,
        }),
      )
      .unwrap()

    await vi.advanceTimersByTimeAsync(100)
  })

describe('recommended books cache', () => {
  it('keeps the random selection across navigation and focus, then refreshes an older selection on remount', async () => {
    const { unmount } = renderRecommendations()

    await finishRequest()
    expect(screen.getByText(/recommended for you/i)).toBeInTheDocument()
    expect(screen.getByText('Book One')).toBeInTheDocument()
    expect(screen.getByText('Book Two')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10 * 60 * 1000)
    })
    const view = renderRecommendations()

    await finishRequest()
    await act(async () => {
      store.dispatch(bookshopApi.internalActions.onFocus())
      store.dispatch(bookshopApi.internalActions.onOnline())

      await Promise.resolve()
    })
    expect(screen.getByText('Book One')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    view.unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6 * 60 * 1000)
    })
    expect(
      booksApi.endpoints.booksByProperty.select('recommended')(store.getState())
        .data,
    ).toEqual(recommendations)
    recommendations = [{ ...book, id: 3, title: 'Fresh recommendation' }]
    const utils = renderRecommendations()

    await finishRequest()
    expect(screen.getByText('Fresh recommendation')).toBeInTheDocument()
    expect(screen.queryByText('Book One')).not.toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    utils.unmount()
  })

  it('hides the section when the server returns an empty selection', async () => {
    recommendations = []
    const view = renderRecommendations()

    await finishRequest()
    expect(screen.queryByText(/recommended for you/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Book One')).not.toBeInTheDocument()
    expect(screen.queryByText('Book Two')).not.toBeInTheDocument()
    view.unmount()
  })
})
