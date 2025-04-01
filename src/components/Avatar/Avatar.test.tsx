import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { Avatar } from './Avatar'

vi.mock('@cloudinary/react', () => ({
  AdvancedImage: ({ imgUrl }: { imgUrl: string }) => (
    <img src={imgUrl} alt="avatar" data-testid="advanced-image" />
  ),
}))

describe('Avatar', () => {
  const imgUrl = 'sample.jpg'
  const size = 40

  it('should render default icon when imgUrl is not provided', () => {
    render(<Avatar imgUrl="" />)
    expect(screen.getByRole('button')).toContainHTML('<svg xmlns')
    expect(screen.queryByTestId('advanced-image')).not.toBeInTheDocument()
  })

  it('should render cloudinary image when imgUrl is provided', () => {
    render(<Avatar imgUrl={imgUrl} />)

    const advancedImage = screen.getByTestId('advanced-image')
    expect(advancedImage).toBeInTheDocument()
    expect(advancedImage).toHaveAttribute('alt', 'avatar')
  })

  it('should call onClick when avatar is clicked', async () => {
    const onClick = vi.fn()
    render(<Avatar imgUrl={imgUrl} onClick={onClick} />)

    const avatar = screen.getByRole('img', { hidden: true })
    await userEvent.click(avatar)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should apply title and custom size correctly', () => {
    render(<Avatar imgUrl={imgUrl} title="User Avatar" $size={size} />)

    const avatarContainer = screen.getByRole('img').closest('button')
    expect(avatarContainer).toHaveAttribute('title', 'User Avatar')
    expect(avatarContainer).toHaveStyle({
      width: `${size}px`,
      height: `${size}px`,
    })
  })
})
