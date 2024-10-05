import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { IconButton } from './IconButton'
import { type IconButtonTypes } from './IconButton.types'

const renderIconButton = (props: Partial<IconButtonTypes> = {}) => {
  const defaultProps: IconButtonTypes = {
    onClick: vi.fn(),
    icon: <svg>image</svg>,
    title: 'icon-button',
  }

  return render(<IconButton {...defaultProps} {...props} />)
}

describe('IconButton', () => {
  it('should render the icon and title', () => {
    renderIconButton()
    expect(screen.getByTitle('icon-button')).toBeInTheDocument()
  })

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    renderIconButton({ onClick })

    const button = screen.getByRole('button')
    await user.click(button)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should pass additional props to the button element', () => {
    renderIconButton({ $flipHorizontal: true, $flipVertical: true })
    expect(screen.getByTitle('icon-button')).toBeInTheDocument()
  })

  it('should render the icon', () => {
    renderIconButton({
      icon: <span data-testid="custom-icon">custom icon</span>,
    })
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    expect(screen.getByText('custom icon')).toBeInTheDocument()
  })
})
