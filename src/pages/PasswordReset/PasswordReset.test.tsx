import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { PasswordReset } from './PasswordReset'
import { postVerifyPasswordReset, postPasswordResetSubmit } from '@/api'

vi.mock('@/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api')>()
  return {
    ...actual,
    postVerifyPasswordReset: vi.fn(),
    postPasswordResetSubmit: vi.fn(),
  }
})

describe('PasswordReset Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.clearAllMocks()
  })

  it('should render the form if reset token is valid', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=123',
      pathname: '/password-reset',
      hash: '',
      state: null,
      key: 'default',
    })
    vi.mocked(postVerifyPasswordReset).mockResolvedValue({
      token: 'valid-token',
    })

    render(<PasswordReset />)

    await waitFor(() => {
      expect(postVerifyPasswordReset).toHaveBeenCalledWith('123')
      expect(screen.getByText(/Password Reset/i)).toBeInTheDocument()
    })
  })

  it('should display an error notification if reset token is missing and navigate to home', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '',
      pathname: '/password-reset',
      hash: '',
      state: null,
      key: 'default',
    })

    render(<PasswordReset />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Invalid or missing password reset token',
      )
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should display an error notification if reset token verification fails', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=invalid',
      pathname: '/password-reset',
      hash: '',
      state: null,
      key: 'default',
    })
    vi.mocked(postVerifyPasswordReset).mockRejectedValue(
      new Error('Invalid token'),
    )

    render(<PasswordReset />)

    await waitFor(() => {
      expect(postVerifyPasswordReset).toHaveBeenCalledWith('invalid')
      expect(toast.error).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should submit new password and display success notification and navigate to login page', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=123',
      pathname: '/password-reset',
      hash: '',
      state: null,
      key: 'default',
    })
    vi.mocked(postVerifyPasswordReset).mockResolvedValue({
      token: 'valid-token',
    })
    vi.mocked(postPasswordResetSubmit).mockResolvedValue({
      message: 'Password reset successful',
    })

    render(<PasswordReset />)

    await waitFor(() => {
      expect(screen.getByText(/Password Reset/i)).toBeInTheDocument()
    })

    const password = 'NewPass123!'

    const newPasswordInput = screen.getByPlaceholderText(/^new password$/i)
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    await userEvent.type(newPasswordInput, password)
    await userEvent.type(confirmPasswordInput, password)
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(postPasswordResetSubmit).toHaveBeenCalledWith(
        'valid-token',
        password,
      )
      expect(toast.success).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
