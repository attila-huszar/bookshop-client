import { type ComponentRef, createRef } from 'react'
import { toast } from 'react-hot-toast'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { useUpdateUserProfileMutation } from '@/store/api/usersApi'
import { PasswordDialog } from './PasswordDialog'

vi.mock('@/store/api/usersApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/usersApi')>()),
  useUpdateUserProfileMutation: vi.fn(),
}))

function renderPasswordDialog(email: string) {
  const ref = createRef<ComponentRef<typeof PasswordDialog>>()
  render(<PasswordDialog ref={ref} email={email} />)

  act(() => {
    ref.current?.showModal()
  })
}

describe('PasswordDialog', () => {
  const email = 'test.email@example.com'
  const mockDispatch = vi.fn()
  beforeEach(() => {
    vi.mocked(useUpdateUserProfileMutation).mockReturnValue([
      mockDispatch,
      { reset: vi.fn() },
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields and submit button', () => {
    renderPasswordDialog(email)

    expect(screen.getByPlaceholderText('Current Password')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText('Confirm New Password'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('sends both passwords to the profile endpoint and closes on success', async () => {
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) })

    renderPasswordDialog(email)

    const dialog: HTMLDialogElement = screen.getByRole('dialog')
    expect(dialog.open).toBe(true)

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

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        currentPassword: 'OldPass123!',
        password: 'NewPass456!',
      })
    })
    expect(mockDispatch).toHaveBeenCalledTimes(1)
    expect(dialog.open).toBe(false)
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
      mockDispatch.mockReturnValue({ unwrap: vi.fn().mockRejectedValue(error) })

      renderPasswordDialog(email)

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

      await userEvent.click(screen.getByRole('button', { name: /submit/i }))

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith({
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
    renderPasswordDialog(email)

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

    await userEvent.click(screen.getByRole('button', { name: /submit/i }))

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
