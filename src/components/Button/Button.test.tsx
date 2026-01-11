import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { CartIcon } from '@/assets/svg'
import { Button } from './Button'
import { ButtonTypes } from './Button.types'

describe('Button', () => {
  const defaultProps: ButtonTypes = {
    onClick: vi.fn(),
    title: 'Test Button',
    children: 'Click me',
  }

  it('should render children correctly', () => {
    render(<Button {...defaultProps} />)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('should render with icon', () => {
    render(<Button {...defaultProps} $icon={<CartIcon />} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('should call onClick when button is clicked', async () => {
    render(<Button {...defaultProps} />)
    const button = screen.getByText('Click me')
    await userEvent.click(button)
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1)
  })
})
