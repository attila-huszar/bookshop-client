import { vi } from 'vitest'
import { ordersLoader } from './ordersLoader'

const { mockFetchUserOrders, mockDispatch } = vi.hoisted(() => ({
  mockFetchUserOrders: vi.fn(() => ({ type: 'orders/fetchUserOrders' })),
  mockDispatch: vi.fn(),
}))

vi.mock('@/store', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store')>()
  return {
    ...actual,
    fetchUserOrders: mockFetchUserOrders,
    store: {
      dispatch: mockDispatch,
    },
  }
})

describe('ordersLoader', () => {
  it('dispatches user orders fetch', () => {
    ordersLoader()

    expect(mockFetchUserOrders).toHaveBeenCalledTimes(1)
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'orders/fetchUserOrders',
    })
  })
})
