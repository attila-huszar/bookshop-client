import { vi } from 'vitest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { ordersLoader } from './ordersLoader'

const { mockDispatch } = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
}))

vi.mock('@/store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store')>()),
  store: { dispatch: mockDispatch },
}))

describe('ordersLoader', () => {
  it('warms the user orders query without retaining a loader subscription', () => {
    const initiate = vi.spyOn(bookshopApi.endpoints.userOrders, 'initiate')

    ordersLoader()

    expect(initiate).toHaveBeenCalledWith(undefined, { subscribe: false })
    expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function))
    initiate.mockRestore()
  })
})
