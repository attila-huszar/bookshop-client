import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { toast } from 'react-hot-toast'
import { PasswordDialogRef } from './PasswordDialog'
import { apiHandler } from '@/api/apiHandler'
import { useAppDispatch } from '@/hooks'
import { updateUser } from '@/store'

vi.mock('@/api/apiHandler', () => ({
  apiHandler: {
    verifyPassword: vi.fn(),
  },
}))

vi.mock('@/store', () => ({
  updateUser: vi.fn(),
}))

describe('PasswordDialog', () => {
  const uuid = 'test-uuid'
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields and submit button', () => {
    render(<PasswordDialogRef uuid={uuid} />)

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
    vi.mocked(apiHandler.verifyPassword).mockResolvedValue(true)
    mockDispatch.mockResolvedValue(true)

    const { container } = render(<PasswordDialogRef uuid={uuid} />)

    const dialog = container.querySelector('dialog')!

    await userEvent.type(
      screen.getByPlaceholderText('Current Password'),
      'oldPassword',
    )

    await userEvent.type(
      screen.getByPlaceholderText('New Password'),
      'newPassword',
    )

    await userEvent.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'newPassword',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    )

    await waitFor(() => {
      expect(apiHandler.verifyPassword).toHaveBeenCalledWith(
        uuid,
        'oldPassword',
      )
      expect(mockDispatch).toHaveBeenCalledWith(
        updateUser({
          uuid,
          fields: { password: expect.any(String) as string },
        }),
      )
      expect(dialog.open).toBe(false)
    })
  })

  it('should show error if current password is invalid', async () => {
    vi.mocked(apiHandler.verifyPassword).mockResolvedValue(false)

    render(<PasswordDialogRef uuid={uuid} />)

    await userEvent.type(
      screen.getByPlaceholderText('Current Password'),
      'invalidPassword',
    )

    await userEvent.type(
      screen.getByPlaceholderText('New Password'),
      'newPassword',
    )

    await userEvent.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'newPassword',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    )

    await waitFor(() => {
      expect(apiHandler.verifyPassword).toHaveBeenCalledWith(
        uuid,
        'invalidPassword',
      )
    })

    expect(toast.error).toHaveBeenCalledWith('Current password invalid', {
      id: 'password-invalid-error',
    })
  })

  it('should show error if new password matches the current password', async () => {
    vi.mocked(apiHandler.verifyPassword).mockResolvedValue(true)

    render(<PasswordDialogRef uuid={uuid} />)

    await userEvent.type(
      screen.getByPlaceholderText('Current Password'),
      'samePassword',
    )

    await userEvent.type(
      screen.getByPlaceholderText('New Password'),
      'samePassword',
    )

    await userEvent.type(
      screen.getByPlaceholderText('Confirm New Password'),
      'samePassword',
    )

    await userEvent.click(
      screen.getByRole('button', { name: /submit/i, hidden: true }),
    )

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Password must be different from current password',
        {
          id: 'password-same-error',
        },
      )
    })
  })
})
