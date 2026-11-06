import { Provider } from 'react-redux'
import { act, renderHook, waitFor } from '@testing-library/react'
import ky from 'ky'
import * as publicApi from '@/api/baseRequest'
import { booksApi } from '@/store/api/booksApi'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cartQuantitySet, cartRestored } from '@/store/slices/cart'
import { createAppStore } from '@/store/store'
import { refreshCartPrices } from '@/services/checkout'
import { cartKey } from '@/constants/keys'
import type { Book } from '@/types'
import { useCart } from './useCart'

const book: Book = {
  id: 7,
  title: 'Book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: 'book.jpg',
  description: '',
  publishYear: 2026,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
let store: ReturnType<typeof createAppStore>
let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>

function wrapper(props: { children: React.ReactNode }) {
  return <Provider store={store}>{props.children}</Provider>
}

beforeEach(() => {
  store = createAppStore()
  store.dispatch(cartRestored([{ id: 7, quantity: 2 }]))
  fetchMock = vi.fn<typeof fetch>().mockResolvedValue(json(book))
  const client = ky.create({
    prefix: 'https://bookshop.test/api',
    retry: 0,
    fetch: fetchMock,
  })
  vi.spyOn(publicApi, 'baseRequest').mockImplementation(client)
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  localStorage.removeItem(cartKey)
  sessionStorage.clear()
  vi.restoreAllMocks()
})

describe('cart details from canonical book queries', () => {
  it('reuses cached details and keeps only intent in Redux', async () => {
    await store.dispatch(booksApi.util.upsertQueryData('book', 7, book))
    const { result } = renderHook(useCart, { wrapper })

    expect(result.current.cartItems).toEqual([
      {
        id: 7,
        quantity: 2,
        title: 'Book',
        imgUrl: 'book.jpg',
        price: 10,
        discount: 0,
        discountPrice: 10,
      },
    ])
    expect(result.current.isLoading).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 2 }])
  })

  it('reads canonical details rather than using stale catalogue list entries', async () => {
    await store.dispatch(
      booksApi.util.upsertQueryData(
        'books',
        { currentPage: 1, itemsPerPage: 8 },
        { books: [{ ...book, price: 1 }], total: 1 },
      ),
    )
    const { result } = renderHook(useCart, { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.current.cartItems[0]?.price).toBe(10)
  })

  it('shares an in-flight book read and does not overwrite quantity changes', async () => {
    let respond!: (response: Response) => void
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        respond = resolve
      }),
    )
    const request = store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    const { result } = renderHook(useCart, { wrapper })
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    act(() => {
      store.dispatch(cartQuantitySet({ cartItem: { id: 7 }, newQuantity: 3 }))
    })
    await act(async () => {
      respond(json(book))
      await request
    })

    await waitFor(() => expect(result.current.cartItems[0]?.quantity).toBe(3))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 3 }])
  })

  it('updates quantity without refetching fresh book details', async () => {
    await store.dispatch(booksApi.util.upsertQueryData('book', 7, book))
    const { result } = renderHook(useCart, { wrapper })

    act(() => {
      store.dispatch(cartQuantitySet({ cartItem: { id: 7 }, newQuantity: 4 }))
    })

    expect(result.current.cartItems[0]?.quantity).toBe(4)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each(['success', 'failure'] as const)(
    'keeps basket edits when a forced price refresh ends in %s',
    async (outcome) => {
      await store.dispatch(booksApi.util.upsertQueryData('book', 7, book))
      const { result } = renderHook(useCart, { wrapper })
      let respond!: (response: Response) => void
      fetchMock.mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          respond = resolve
        }),
      )
      let pending!: Promise<void>

      act(() => {
        pending = result.current.refetch()
      })
      await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
      act(() => {
        store.dispatch(cartQuantitySet({ cartItem: { id: 7 }, newQuantity: 5 }))
      })
      await act(async () => {
        respond(
          outcome === 'success'
            ? json({ ...book, price: 20, discountPrice: 20 })
            : json({}, 503),
        )
        await pending
      })

      expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 5 }])
      expect(result.current.cartItems[0]?.quantity).toBe(5)
    },
  )

  it('waits for the older read before forcing fresh prices', async () => {
    let respond!: (response: Response) => void
    fetchMock
      .mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          respond = resolve
        }),
      )
      .mockResolvedValueOnce(json({ ...book, price: 20, discountPrice: 20 }))
    const old = store.dispatch(
      booksApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const refresh = store.dispatch(refreshCartPrices())
    expect(fetchMock).toHaveBeenCalledTimes(1)
    respond(json(book))
    await old
    await refresh

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(
      booksApi.endpoints.book.select(7)(store.getState()).data?.price,
    ).toBe(20)
  })

  it('allows retry after a failed read without losing basket intent', async () => {
    fetchMock
      .mockResolvedValueOnce(json({}, 503))
      .mockResolvedValueOnce(json(book))
    const { result } = renderHook(useCart, { wrapper })
    await waitFor(() => expect(result.current.error).toBeDefined())

    await act(async () => {
      await result.current.refetch()
    })

    await waitFor(() => expect(result.current.error).toBeUndefined())
    expect(result.current.cartItems[0]?.quantity).toBe(2)
    expect(store.getState().cart.cartItems).toEqual([{ id: 7, quantity: 2 }])
  })

  it('handles an empty basket without making any requests', () => {
    store.dispatch(cartRestored([]))
    const { result } = renderHook(useCart, { wrapper })

    expect(result.current.cartItems).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
