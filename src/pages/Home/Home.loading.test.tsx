import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { act, render, screen, waitFor } from '@testing-library/react'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { newsApi } from '@/store/api/newsApi'
import { booksQueryArgs } from '@/store/selectors'
import { createAppStore } from '@/store/store'
import { Recommended } from '@/components/Recommended'
import type { Book } from '@/types'
import { News } from './components/News/News'
import { Releases } from './components/Releases/Releases'
import { TopSellers } from './components/TopSellers/TopSellers'
import { Home } from './Home'

let store: ReturnType<typeof createAppStore>

const book: Book = {
  id: 1,
  title: 'Featured book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: 'book.jpg',
  description: 'A book',
  publishYear: 2026,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: true,
  newRelease: true,
}

beforeEach(() => {
  store = createAppStore()
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  vi.restoreAllMocks()
})

describe('home section loading', () => {
  it.each([
    {
      heading: 'New Releases This Week',
      Component: Releases,
      data: [book],
    },
    { heading: 'Top Sellers', Component: TopSellers, data: [book] },
    { heading: 'Recommended for you', Component: Recommended, data: [book] },
    {
      heading: 'News',
      Component: News,
      data: [
        { id: 1, title: 'Featured news', content: 'News', img: 'news.jpg' },
      ],
    },
  ])(
    'loads $heading quietly and displays content when it arrives',
    async ({ heading, Component, data }) => {
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

      render(
        <Provider store={store}>
          <MemoryRouter>
            <Component />
          </MemoryRouter>
        </Provider>,
      )

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      expect(screen.queryByRole('heading', { name: heading }) !== null).toBe(
        Component === Releases,
      )

      act(() => {
        completeRequest(
          new Response(JSON.stringify(data), {
            headers: { 'content-type': 'application/json' },
          }),
        )
      })

      await waitFor(() => {
        expect(screen.getAllByAltText(data[0]!.title).length).toBeGreaterThan(0)
      })
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    },
  )
})

describe('homepage book errors', () => {
  const renderHome = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>,
    )

  it('ignores cached catalogue failures', async () => {
    vi.spyOn(publicApi, 'baseRequest')
      .mockRejectedValueOnce(new Error('Catalogue unavailable'))
      .mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () => Promise.resolve(Response.json([])),
        }),
      )
    await store.dispatch(
      booksApi.endpoints.books.initiate(booksQueryArgs(store.getState()), {
        subscribe: false,
      }),
    )

    renderHome()

    await waitFor(() => {
      expect(newsApi.endpoints.news.select()(store.getState()).isSuccess).toBe(
        true,
      )
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(5)
  })

  it.each(['newRelease', 'topSellers', 'recommended'] as const)(
    'displays failures from the %s section',
    async (property) => {
      vi.spyOn(publicApi, 'baseRequest').mockImplementation((url, options) => {
        const searchParams = options?.searchParams as
          Record<string, unknown> | undefined
        const fails =
          property === 'recommended'
            ? url === 'books/recommended'
            : searchParams?.[property] === true

        return ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () =>
            Promise.resolve(
              Response.json(fails ? { code: 'NOT_FOUND' } : [], {
                status: fails ? 404 : 200,
              }),
            ),
        })
      })

      renderHome()

      const dialog = await screen.findByRole('dialog')
      expect(dialog).toHaveTextContent(
        "Couldn't load the shop. Please try again later.",
      )
      expect(dialog).toHaveTextContent('The requested item could not be found.')
    },
  )
})
