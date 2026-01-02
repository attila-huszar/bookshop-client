import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import { PasswordDialog } from './PasswordDialog'
import { useAppDispatch } from '@/hooks'
import { postUserLogin } from '@/api'
import { updateUser } from '@/store'

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    postUserLogin: vi.fn(),
  }
})

vi.mock('@/store', () => ({
  updateUser: vi.fn(),
}))

describe('PasswordDialog', () => {
  const email = 'test-uuid'
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields and submit button', () => {
    render(<PasswordDialog ref={null} email={email} />)

    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Confirm New Password'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    ).toBeInTheDocument()
  })

  it('should call verifyPassword and dispatch updateUser on successful password change, then close the dialog', async () => {
    vi.mocked(postUserLogin).mockResolvedValue({
      accessToken: expect.any(String) as string,
      firstName: expect.any(String) as string,
    })
    mockDispatch.mockResolvedValue({
      meta: { requestStatus: 'fulfilled' },
    })

    const { container } = render(<PasswordDialog ref={null} email={email} />)

    const dialog = container.querySelector('dialog')!

    await userEvent.type(
      screen.getByPlaceholderText('Current Password'),
      'OldPass123!',
    )

    await userEvent.type(
      screen.getByPlaceholderText('New Password'),
      'NewPass456!',
    )

    await userEvent.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'NewPass456!',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    )

    await waitFor(() => {
      expect(postUserLogin).toHaveBeenCalledWith({
        email,
        password: 'OldPass123!',
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        updateUser({ password: 'NewPass456!' }),
      )
      expect(dialog.open).toBe(false)
    })
  })

  it('should show error if current password is invalid', async () => {
    vi.mocked(postUserLogin).mockRejectedValue(new Error('Invalid password'))

    render(<PasswordDialog ref={null} email={email} />)

    await userEvent.type(
      screen.getByPlaceholderText('Current Password'),
      'InvalidPass123!',
    )

    await userEvent.type(
      screen.getByPlaceholderText('New Password'),
      'NewPass456!',
    )

    await userEvent.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'NewPass456!',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    )

    await waitFor(() => {
      expect(postUserLogin).toHaveBeenCalledWith({
        email,
        password: 'InvalidPass123!',
      })
      expect(toast.error).toHaveBeenCalledWith('Current password invalid', {
        id: 'password-change-fail',
      })
    })
  })

  it('should show error if new password matches the current password', async () => {
    vi.mocked(postUserLogin).mockResolvedValue({
      accessToken: expect.any(String) as string,
      firstName: expect.any(String) as string,
    })

    render(<PasswordDialog ref={null} email={email} />)

    await userEvent.type(
      screen.getByPlaceholderText('Current Password'),
      'SamePass123!',
    )

    await userEvent.type(
      screen.getByPlaceholderText('New Password'),
      'SamePass123!',
    )

    await userEvent.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'SamePass123!',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Password must be different from current password',
        {
          id: 'password-change-fail',
        },
      )
    })
  })
})
