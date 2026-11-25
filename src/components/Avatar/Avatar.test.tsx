import { Providers } from '@/testUtils'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  const imgUrl = 'sample.jpg'

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

    const changeAvatar = vi.fn()
    render(
      <Avatar
        imgUrl={imgUrl}
        title="Avatar"
        onClick={changeAvatar}
        $hoverControls
      />,
      { wrapper: Providers },
    )
    const user = userEvent.setup()
    const remove = screen.getByRole('button', { name: 'Remove Avatar' })
    await user.tab()
    expect(screen.getByRole('button', { name: 'Avatar' })).toHaveFocus()
    await user.tab()
    expect(remove).toHaveFocus()
    await user.keyboard('[Space]')

    expect(remove).toBeDisabled()
    expect(remove).toHaveAttribute('aria-busy', 'true')
    await user.click(remove)
    expect(changeAvatar).not.toHaveBeenCalled()
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
})
