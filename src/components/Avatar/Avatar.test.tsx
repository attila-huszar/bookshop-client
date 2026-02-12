import { Providers } from '@/setupTests'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  const imgUrl = 'sample.jpg'
  const size = 40

  it('should render default icon when imgUrl is not provided', () => {
    render(<Avatar imgUrl="" />, { wrapper: Providers })
    expect(screen.getByTestId('default-avatar-icon')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should render image when imgUrl is provided', () => {
    render(<Avatar imgUrl={imgUrl} title="Avatar" />, { wrapper: Providers })

    const avatarImage = screen.getByRole('img')
    expect(avatarImage).toBeInTheDocument()
    expect(avatarImage).toHaveAttribute('alt', 'Avatar')
  })

  it('should call onClick when avatar is clicked', async () => {
    const onClick = vi.fn()
    render(<Avatar imgUrl={imgUrl} onClick={onClick} title="Avatar" />, {
      wrapper: Providers,
    })

    const avatar = screen.getByRole('button', { name: 'Avatar' })
    await userEvent.click(avatar)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should apply title and custom size correctly', () => {
    render(<Avatar imgUrl={imgUrl} title="User Avatar" $size={size} />, {
      wrapper: Providers,
    })

    const avatarContainer = screen.getByTitle('User Avatar')
    expect(avatarContainer).toHaveStyle({
      width: `${size}px`,
      height: `${size}px`,
    })
  })
})
