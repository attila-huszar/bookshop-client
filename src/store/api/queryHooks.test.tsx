import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { act, renderHook, waitFor } from '@testing-library/react'
import ky from 'ky'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from 'vitest'
import { baseRequest } from '@/api/baseRequest'
import { createAppStore } from '@/store/store'
import type { Filters } from '@/types'
import { bookshopApi, useSearchOptionsQuery } from './bookshopApi'

const searchOptions: Pick<Filters, 'genre' | 'price' | 'publishYear'> = {
  genre: ['Fiction', 'Drama'],
  price: [0, 100],
  publishYear: [1900, 2024],
}

let store: ReturnType<typeof createAppStore>

function StoreProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}

beforeEach(() => {
  store = createAppStore()
  vi.spyOn(baseRequest, 'get').mockImplementation(() =>
    ky.get('https://bookshop.test/mock', {
      retry: 0,
      fetch: () =>
        Promise.resolve(
          new Response(JSON.stringify(searchOptions), {
            headers: { 'content-type': 'application/json' },
          }),
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

describe('options-only query hooks', () => {
  it('reads the existing endpoint cache without arguments or another request', async () => {
    await store.dispatch(
      bookshopApi.util.upsertQueryData(
        'searchOptions',
        undefined,
        searchOptions,
      ),
    )

    const { result } = renderHook(() => useSearchOptionsQuery(), {
      wrapper: StoreProvider,
    })

    expectTypeOf(result.current.data).toEqualTypeOf<
      typeof searchOptions | undefined
    >()
    expect(result.current.data).toEqual(searchOptions)
    expect(result.current.isSuccess).toBe(true)
    expect(baseRequest.get).not.toHaveBeenCalled()
  })

  it('supports skipping and infers the selected result when enabled', async () => {
    const { result, rerender } = renderHook(
      ({ skip }) =>
        useSearchOptionsQuery({
          skip,
          selectFromResult: ({ data }) => ({ genres: data?.genre ?? [] }),
        }),
      { initialProps: { skip: true }, wrapper: StoreProvider },
    )

    expectTypeOf(result.current.genres).toEqualTypeOf<string[]>()
    expectTypeOf(result.current).not.toHaveProperty('data')
    expectTypeOf(result.current.refetch).toBeFunction()
    expect(result.current.genres).toEqual([])
    expect(baseRequest.get).not.toHaveBeenCalled()

    rerender({ skip: false })

    await waitFor(() => {
      expect(result.current.genres).toEqual(searchOptions.genre)
    })
    expect(baseRequest.get).toHaveBeenCalledTimes(1)
    expect(
      bookshopApi.endpoints.searchOptions.select()(store.getState()).data,
    ).toEqual(searchOptions)
  })
})
