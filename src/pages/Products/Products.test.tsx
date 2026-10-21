import { act } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { booksQueryArgs } from '@/store/selectors'
import { applyBooksFilters } from '@/store/slices/books'
import { createAppStore } from '@/store/store'
import type { Book } from '@/types'
import { Products } from './Products'

vi.mock('@/components/Card', () => ({
  Card: ({ book }: { book: Book }) => <div>{book.title}</div>,
}))

describe('catalogue query subscriptions', () => {
  let store: ReturnType<typeof createAppStore>

  beforeEach(async () => {
    store = createAppStore()
    await store.dispatch(
      bookshopApi.util.upsertQueryData('searchOptions', undefined, {
        genre: ['Fiction', 'Drama'],
        price: [0, 100],
        publishYear: [1900, 2024],
      }),
    )
    store.dispatch(
      applyBooksFilters({
        ...store.getState().books.booksFilters.active,
        genre: ['Fiction'],
      }),
    )
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
    vi.restoreAllMocks()
  })

  const renderProducts = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Products />
        </MemoryRouter>
      </Provider>,
    )

  it('shows loading until an empty response confirms there are no matches', async () => {
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

    renderProducts()

    expect(screen.getByText('Loading books')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reset Filters' }),
    ).not.toBeInTheDocument()

    act(() => {
      completeRequest(
        new Response('[]', {
          headers: {
            'content-type': 'application/json',
            'x-total-count': '0',
          },
        }),
      )
    })

    expect(
      await screen.findByRole('button', { name: 'Reset Filters' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Loading books')).not.toBeInTheDocument()
  })

  it('keeps cached books visible during a background refresh', async () => {
    let completeRefresh!: (response: Response) => void
    const refreshResponse = new Promise<Response>((resolve) => {
      completeRefresh = resolve
    })
    vi.spyOn(publicApi, 'baseRequest')
      .mockImplementationOnce(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () =>
            Promise.resolve(
              new Response(JSON.stringify([{ id: 1, title: 'Cached book' }]), {
                headers: {
                  'content-type': 'application/json',
                  'x-total-count': '1',
                },
              }),
            ),
        }),
      )
      .mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () => refreshResponse,
        }),
      )

    renderProducts()
    expect(await screen.findByText('Cached book')).toBeInTheDocument()

    let refresh!: ReturnType<
      ReturnType<typeof bookshopApi.endpoints.books.initiate>
    >
    act(() => {
      refresh = store.dispatch(
        bookshopApi.endpoints.books.initiate(booksQueryArgs(store.getState()), {
          subscribe: false,
          forceRefetch: true,
        }),
      )
    })

    expect(screen.getByText('Cached book')).toBeInTheDocument()
    expect(screen.queryByText('Loading books')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reset Filters' }),
    ).not.toBeInTheDocument()

    await act(async () => {
      completeRefresh(
        new Response(JSON.stringify([{ id: 2, title: 'Updated book' }]), {
          headers: {
            'content-type': 'application/json',
            'x-total-count': '1',
          },
        }),
      )
      await refresh
    })

    expect(await screen.findByText('Updated book')).toBeInTheDocument()
  })

  it('fetches a new page using applied filters while keeping draft edits separate', async () => {
    const params: URLSearchParams[] = []
    let completeSecondPage!: () => void
    const secondPage = new Promise<void>((resolve) => {
      completeSecondPage = resolve
    })
    vi.spyOn(publicApi, 'baseRequest').mockImplementation((_url, options) => {
      const searchParams = options?.searchParams as URLSearchParams
      params.push(searchParams)

      return ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: async () => {
          if (searchParams.get('page') === '2') {
            await secondPage
          }

          return new Response(
            JSON.stringify([
              {
                id: Number(searchParams.get('page')),
                title: `Page ${searchParams.get('page')} book`,
              },
            ]),
            {
              headers: {
                'content-type': 'application/json',
                'x-total-count': '24',
              },
            },
          )
        },
      })
    })
    renderProducts()
    expect(await screen.findByText('Page 1 book')).toBeInTheDocument()

    await userEvent.click(screen.getByLabelText('Drama'))
    expect(store.getState().books.booksFilters.active.genre).toEqual(['Drama'])
    expect(store.getState().books.booksAppliedFilters?.genre).toEqual([
      'Fiction',
    ])

    await userEvent.click(screen.getByRole('button', { name: 'Next Page' }))

    expect(screen.getByText('Loading books')).toBeInTheDocument()
    expect(screen.queryByText('Page 1 book')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reset Filters' }),
    ).not.toBeInTheDocument()

    act(() => {
      completeSecondPage()
    })

    expect(await screen.findByText('Page 2 book')).toBeInTheDocument()
    expect(params.map((value) => value.get('page'))).toEqual(['1', '2'])
    expect(params.every((value) => value.get('genre') === 'Fiction')).toBe(true)
  })

  it('displays catalogue failures while keeping the filter controls available', async () => {
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () =>
          Promise.resolve(
            Response.json({ code: 'NOT_FOUND' }, { status: 404 }),
          ),
      }),
    )

    renderProducts()

    expect(await screen.findByText('Error loading books')).toBeInTheDocument()
    expect(
      screen.getByText('The requested item could not be found.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('complementary')).toBeInTheDocument()
    expect(screen.queryByText('Loading books')).not.toBeInTheDocument()
  })

  it('displays catalogue books despite a cached recommendations failure', async () => {
    vi.spyOn(publicApi, 'baseRequest')
      .mockRejectedValueOnce(new Error('Recommendations unavailable'))
      .mockImplementation(() =>
        ky.get('https://bookshop.test/mock', {
          retry: 0,
          fetch: () =>
            Promise.resolve(
              Response.json([{ id: 1, title: 'Catalogue book' }], {
                headers: { 'x-total-count': '1' },
              }),
            ),
        }),
      )
    await store.dispatch(
      bookshopApi.endpoints.booksByProperty.initiate('recommended', {
        subscribe: false,
      }),
    )

    renderProducts()

    expect(await screen.findByText('Catalogue book')).toBeInTheDocument()
    expect(screen.queryByText('Error loading books')).not.toBeInTheDocument()
    expect(publicApi.baseRequest).toHaveBeenCalledTimes(2)
  })
})
