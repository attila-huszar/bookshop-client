import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { CartIcon } from '@/assets/svg'
import { Button } from './Button'

describe('Button', () => {
  it('renders its label and icon and handles clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} title="Add to basket" $icon={<CartIcon />}>
        Add to basket
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Add to basket' })
    expect(button).toContainElement(screen.getByRole('img'))

    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
