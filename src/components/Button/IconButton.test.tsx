import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { IconButton } from './IconButton'

describe('IconButton', () => {
  it('renders its icon and title and handles clicks', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <IconButton
        onClick={onClick}
        icon={<span aria-hidden="true">Custom icon</span>}
        title="Icon action"
      />,
    )

    const button = screen.getByRole('button', { name: 'Icon action' })
    expect(button).toContainElement(screen.getByText('Custom icon'))
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
