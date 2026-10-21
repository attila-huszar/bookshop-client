import { vi } from 'vitest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { productLoader } from './productLoader'

const { mockDispatch } = vi.hoisted(() => ({ mockDispatch: vi.fn() }))

vi.mock('@/store/store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/store')>()),
  store: { dispatch: mockDispatch },
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('productLoader', () => {
  it('prefetches book details without delaying navigation until the response arrives', () => {
    const prefetch = vi.spyOn(bookshopApi.util, 'prefetch')

    const result = productLoader({
      request: new Request('https://bookshop.test/book?id=1'),
    })

    expect(result).toBe(1)
    expect(prefetch).toHaveBeenCalledWith('book', 1, {
      ifOlderThan: cacheTimes.catalogue,
    })
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
  })

  it.each([
    '',
    '?id=invalid',
    '?id=0',
    '?id=-1',
    '?id=1.5',
    '?id=Infinity',
    '?id=9007199254740992',
    '?id=0x10',
    '?id=1e2',
    '?id=%20',
  ])('does not fetch an invalid book ID (%s)', (search) => {
    const result = productLoader({
      request: new Request(`https://bookshop.test/book${search}`),
    })

    expect(result).toBeNull()
    expect(mockDispatch).not.toHaveBeenCalled()
  })
})
