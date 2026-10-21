import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { baseRequest } from '@/api/baseRequest'
import { localStorageAdapter } from '@/helpers/browserStorage'
import { cartKey } from '@/constants/keys'
import type { Book } from '@/types'
import { bookshopApi } from '../api/bookshopApi'
import { createAppStore } from '../store'
import { fetchCartItems } from './cart'

const book: Book = {
  id: 7,
  title: 'Book',
  author: 'Author',
  genre: 'Fiction',
  imgUrl: 'book.jpg',
  description: '',
  publishYear: 2024,
  rating: 5,
  price: 10,
  discount: 0,
  discountPrice: 10,
  topSellers: false,
  newRelease: false,
}

const cartItems = [{ id: 7, quantity: 2 }]
const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
  })

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
  localStorageAdapter.set(cartKey, cartItems)
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  localStorageAdapter.remove(cartKey)
  vi.restoreAllMocks()
})

describe('cart hydration query cache', () => {
  it('reuses the book endpoint cache without making a request', async () => {
    await store.dispatch(bookshopApi.util.upsertQueryData('book', 7, book))
    const get = vi.spyOn(baseRequest, 'get')

    await store.dispatch(fetchCartItems({ cartItems })).unwrap()

    expect(get).not.toHaveBeenCalled()
    expect(store.getState().cart.cartItems).toEqual([
      {
        id: 7,
        title: 'Book',
        price: 10,
        discount: 0,
        discountPrice: 10,
        imgUrl: 'book.jpg',
        quantity: 2,
      },
    ])
  })

  it('requests book details instead of accepting a stale catalogue list entry', async () => {
    await store.dispatch(
      bookshopApi.util.upsertQueryData(
        'books',
        { currentPage: 1, itemsPerPage: 8 },
        { books: [book], total: 1 },
      ),
    )
    const get = vi.spyOn(baseRequest, 'get').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () =>
          Promise.resolve(
            jsonResponse({ ...book, price: 20, discountPrice: 20 }),
          ),
      }),
    )

    await store.dispatch(fetchCartItems({ cartItems })).unwrap()

    expect(get).toHaveBeenCalledTimes(1)
    expect(store.getState().cart.cartItems[0]?.price).toBe(20)
    expect(
      bookshopApi.endpoints.book.select(7)(store.getState()).data?.price,
    ).toBe(20)
  })

  it('shares an in-flight book request during hydration', async () => {
    let resolveResponse!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve
    })
    const get = vi.spyOn(baseRequest, 'get').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => response,
      }),
    )
    const query = store.dispatch(
      bookshopApi.endpoints.book.initiate(7, { subscribe: false }),
    )
    const hydration = store.dispatch(fetchCartItems({ cartItems }))

    await vi.waitFor(() => {
      expect(get).toHaveBeenCalledTimes(1)
    })
    resolveResponse(jsonResponse(book))
    await Promise.all([query.unwrap(), hydration.unwrap()])

    expect(get).toHaveBeenCalledTimes(1)
    expect(store.getState().cart.cartItems[0]?.quantity).toBe(2)
  })
})
