import { Providers } from '@/testUtils'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  const imgUrl = 'sample.jpg'
  const size = 40

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('disables avatar removal until the update completes', async () => {
    let completeRequest!: (value: Response) => void
    const pending = new Promise<Response>((resolve) => {
      completeRequest = resolve
    })
    vi.spyOn(privateApi, 'authRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => pending,
      }),
    )

    render(<Avatar imgUrl={imgUrl} title="Avatar" $hoverControls />, {
      wrapper: Providers,
    })
    const remove = screen.getByRole('button', { name: 'Remove Avatar' })
    await userEvent.click(remove)

    expect(remove).toBeDisabled()
    expect(remove).toHaveAttribute('aria-busy', 'true')
    await userEvent.click(remove)
    expect(privateApi.authRequest).toHaveBeenCalledTimes(1)

    act(() => {
      completeRequest(
        new Response('{}', {
          headers: { 'content-type': 'application/json' },
        }),
      )
    })

    await waitFor(() => {
      expect(remove).toBeEnabled()
    })
  })

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
