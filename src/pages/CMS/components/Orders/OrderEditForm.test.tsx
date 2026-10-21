import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUpdateOrderMutation } from '@/store/api/bookshopApi'
import type { Order } from '@/types'
import { OrderEditForm } from './OrderEditForm'

vi.mock('@/store/api/bookshopApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/bookshopApi')>()),
  useUpdateOrderMutation: vi.fn(),
}))

vi.mock('@/components/Button', () => ({
  Button: ({ children, type, disabled }: React.ComponentProps<'button'>) => (
    <button type={type} disabled={disabled}>
      {children}
    </button>
  ),
}))

vi.mock('@/components/CountrySelect', () => ({
  CountrySelect: ({ readOnly }: { readOnly?: boolean }) => (
    <button type="button" disabled={readOnly}>
      Select country
    </button>
  ),
}))

const order: Order = {
  id: 1,
  paymentId: 'pi_test',
  paymentStatus: 'processing',
  total: 12,
  currency: 'USD',
  items: [],
  firstName: null,
  lastName: null,
  email: null,
  shipping: null,
  paidAt: null,
  createdAt: '2026-10-01T10:00:00Z',
  updatedAt: '2026-10-01T10:00:00Z',
}

describe('OrderEditForm', () => {
  const dispatch = vi.fn()

  beforeEach(() => {
    dispatch.mockReturnValue({ unwrap: () => Promise.resolve(order) })
    vi.mocked(useUpdateOrderMutation).mockReturnValue([
      dispatch,
      { reset: vi.fn() },
    ])
  })

  it.each([
    {
      firstName: '',
      lastName: '',
      email: '',
      expected: { firstName: null, lastName: null, email: null },
    },
    {
      firstName: '  ',
      lastName: '  ',
      email: '  ',
      expected: { firstName: null, lastName: null, email: null },
    },
    {
      firstName: ' 李 ',
      lastName: ' O’Connor ',
      email: ' jane@example.com ',
      expected: {
        firstName: '李',
        lastName: 'O’Connor',
        email: 'jane@example.com',
      },
    },
  ])(
    'normalizes optional customer fields before submitting: $expected',
    async ({ firstName, lastName, email, expected }) => {
      const user = userEvent.setup()

      render(
        <OrderEditForm
          editedItem={{
            ...order,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'original@example.com',
            items: [
              {
                id: 1,
                title: 'Book',
                author: null,
                imgUrl: '',
                price: 12,
                discount: 0,
                quantity: 1,
              },
            ],
          }}
          onClose={vi.fn()}
        />,
      )

      for (const [placeholder, value] of [
        ['First Name', firstName],
        ['Last Name', lastName],
        ['Email', email],
      ]) {
        const input = screen.getByPlaceholderText(placeholder!)

        await user.clear(input)

        if (value) {
          await user.type(input, value)
        }
      }

      await user.click(screen.getByRole('button', { name: /Save/ }))
      await waitFor(() => {
        expect(dispatch).toHaveBeenCalledWith({
          ...expected,
          shipping: null,
          paymentId: 'pi_test',
        })
      })
      expect(dispatch).toHaveBeenCalledTimes(1)
    },
  )

  it('passes read-only mode to the custom country selector', () => {
    render(<OrderEditForm editedItem={order} onClose={vi.fn()} readOnly />)
    expect(
      screen.getByRole('button', { name: 'Select country' }),
    ).toHaveAttribute('disabled')
    expect(
      screen.queryByRole('button', { name: /Save/ }),
    ).not.toBeInTheDocument()
  })

  it('displays an unlinked draft without offering an invalid save', () => {
    render(
      <OrderEditForm
        editedItem={{ ...order, paymentId: null }}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText(/Draft order/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Save/ }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Select country' }),
    ).toHaveAttribute('disabled')
  })
})
