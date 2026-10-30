import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { bookshopApi } from './api/bookshopApi'
import { ordersApi } from './api/ordersApi'
import { booksQueryArgs, userSelector } from './selectors'
import { setBooksFilterGenre } from './slices/books'
import { authSessionChanged } from './slices/user'
import { createAppStore } from './store'

let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
})

describe('catalogue query arguments', () => {
  it('keeps its result stable when queries or draft filters change', async () => {
    const result = booksQueryArgs(store.getState())
    await store.dispatch(
      ordersApi.util.upsertQueryData('userOrders', undefined, []),
    )

    expect(booksQueryArgs(store.getState())).toBe(result)

    store.dispatch(setBooksFilterGenre('Fiction'))

    expect(booksQueryArgs(store.getState())).toBe(result)
  })
})

describe('session and profile state', () => {
  it('only marks a missing profile as loading when there is an authenticated session', () => {
    expect(userSelector(store.getState()).userIsLoading).toBe(false)

    store.dispatch(authSessionChanged('access-token'))

    expect(userSelector(store.getState()).userIsLoading).toBe(true)
  })
})
