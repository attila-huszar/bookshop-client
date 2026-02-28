import { Providers } from '@/setupTests'
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ordersSelector, userSelector } from '@/store'
import { useAppSelector } from '@/hooks'
import { Orders } from './Orders'

vi.mock('@/store', () => ({
  ordersSelector: vi.fn(),
  userSelector: vi.fn(),
}))

describe('Orders page', () => {
  beforeEach(() => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === ordersSelector) {
        return {
          orders: [],
          ordersIsLoading: false,
          ordersError: null,
        } as ReturnType<typeof useAppSelector>
      }

      if (selector === userSelector) {
        return {
          userData: {
            firstName: 'July',
          },
        } as ReturnType<typeof useAppSelector>
      }

      return null as ReturnType<typeof useAppSelector>
    })
  })

  it('renders loading state', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === ordersSelector) {
        return {
          orders: [],
          ordersIsLoading: true,
          ordersError: null,
        } as ReturnType<typeof useAppSelector>
      }
      return { userData: null } as ReturnType<typeof useAppSelector>
    })

    render(<Orders />, { wrapper: Providers })

    expect(screen.getByText(/loading your orders/i)).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<Orders />, { wrapper: Providers })

    expect(screen.getByText(/you have no orders yet/i)).toBeInTheDocument()
  })

  it('renders error state', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === ordersSelector) {
        return {
          orders: [],
          ordersIsLoading: false,
          ordersError: 'Network error',
        } as ReturnType<typeof useAppSelector>
      }

      return { userData: null } as ReturnType<typeof useAppSelector>
    })

    render(<Orders />, { wrapper: Providers })

    expect(screen.getByText(/failed to load your orders/i)).toBeInTheDocument()
  })

  it('renders orders and item rows', () => {
    vi.mocked(useAppSelector).mockImplementation((selector) => {
      if (selector === ordersSelector) {
        return {
          orders: [
            {
              id: 11,
              paymentId: 'pi_111',
              paymentStatus: 'succeeded',
              total: 4200,
              currency: 'usd',
              firstName: 'July',
              lastName: 'Smith',
              email: 'july@test.com',
              shipping: null,
              paidAt: '2026-02-20T10:00:00.000Z',
              createdAt: '2026-02-20T09:30:00.000Z',
              updatedAt: '2026-02-20T10:00:00.000Z',
              items: [
                {
                  id: 1,
                  title: 'The Pragmatic Programmer',
                  author: 'Andrew Hunt',
                  imgUrl: 'https://example.com/pragmatic-programmer.jpg',
                  price: 2100,
                  discount: 0,
                  quantity: 2,
                },
              ],
            },
          ],
          ordersIsLoading: false,
          ordersError: null,
        } as ReturnType<typeof useAppSelector>
      }

      return {
        userData: {
          firstName: 'July',
        },
      } as ReturnType<typeof useAppSelector>
    })

    render(<Orders />, { wrapper: Providers })

    expect(
      screen.getByRole('heading', { name: /july's recent orders/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/order #11/i)).toBeInTheDocument()
    expect(screen.getByText(/the pragmatic programmer/i)).toBeInTheDocument()
    expect(
      screen.getByRole('img', { name: /the pragmatic programmer/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/status:/i)).toBeInTheDocument()
    expect(screen.getByText(/payment id:/i)).toBeInTheDocument()
  })
})
