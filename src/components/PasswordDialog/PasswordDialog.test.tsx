import { toast } from 'react-hot-toast'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { updateUserProfile } from '@/store'
import { useAppDispatch } from '@/hooks'
import { PasswordDialog } from './PasswordDialog'

vi.mock('@/store', () => ({
  updateUserProfile: vi.fn(),
}))

describe('PasswordDialog', () => {
  const email = 'test.email@example.com'
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

  it('sends both passwords to the profile endpoint and closes on success', async () => {
    mockDispatch.mockResolvedValue({
      meta: { requestStatus: 'fulfilled' },
    })

    render(<PasswordDialog ref={null} email={email} />)

    const dialog: HTMLDialogElement = screen.getByRole('dialog', {
      hidden: true,
    })

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
      expect(updateUserProfile).toHaveBeenCalledWith({
        currentPassword: 'OldPass123!',
        password: 'NewPass456!',
      })
      expect(mockDispatch).toHaveBeenCalledTimes(1)
      expect(dialog.open).toBe(false)
    })
  })

  it.each([
    {
      error: { message: 'Current password is incorrect' },
      message: 'Current password is incorrect',
    },
    {
      error: undefined,
      message: 'Failed to change password, please try again later',
    },
  ])(
    'shows "$message" when the password update fails',
    async ({ error, message }) => {
      mockDispatch.mockResolvedValue({
        meta: { requestStatus: 'rejected' },
        error,
      })

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
        expect(updateUserProfile).toHaveBeenCalledWith({
          currentPassword: 'InvalidPass123!',
          password: 'NewPass456!',
        })
        expect(toast.error).toHaveBeenCalledWith(message, {
          id: 'password-change-fail',
        })
      })
    },
  )

  it('should show error if new password matches the current password', async () => {
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
