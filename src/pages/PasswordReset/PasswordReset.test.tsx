import { StrictMode } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { postPasswordResetSubmit, postVerifyPasswordReset } from '@/api/users'
import { AuthErrorCode } from '@/types/ApiError'
import { PasswordReset } from './PasswordReset'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}))

vi.mock('@/api/users', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/users')>()),
  postVerifyPasswordReset: vi.fn(),
  postPasswordResetSubmit: vi.fn(),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })

  return { promise, resolve, reject }
}

describe('PasswordReset', () => {
  const navigate = vi.fn()
  const location = {
    search: '?token=reset-token',
    pathname: '/password-reset',
    hash: '',
    state: null,
    key: 'default',
  }
  const password = 'NewPass123!'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useLocation).mockReturnValue(location)
    vi.mocked(postVerifyPasswordReset)
      .mockReset()
      .mockResolvedValue({ token: 'reset-token' })
    vi.mocked(postPasswordResetSubmit)
      .mockReset()
      .mockResolvedValue({ success: true })
  })

  const renderReadyForm = async () => {
    const view = render(<PasswordReset />)
    await screen.findByLabelText('New Password')

    return view
  }

  const fillPasswords = async (confirmation = password) => {
    await userEvent.type(screen.getByLabelText('New Password'), password)
    await userEvent.type(
      screen.getByLabelText('Confirm New Password'),
      confirmation,
    )
  }

  it('allows Strict Mode effect replay and processes only the active result', async () => {
    const response = deferred<{ token: string }>()
    vi.mocked(postVerifyPasswordReset).mockReturnValue(response.promise)
    render(
      <StrictMode>
        <PasswordReset />
      </StrictMode>,
    )

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
    expect(postVerifyPasswordReset).toHaveBeenCalledTimes(2)
    expect(postVerifyPasswordReset).toHaveBeenNthCalledWith(1, 'reset-token')
    expect(postVerifyPasswordReset).toHaveBeenNthCalledWith(2, 'reset-token')
    await act(async () => {
      response.resolve({ token: 'reset-token' })
      await response.promise
    })

    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(toast.success).toHaveBeenCalledExactlyOnceWith(
      i18n.t('auth.enterNewPassword'),
    )
  })

  it('shows labeled password inputs and focuses the first after verification', async () => {
    await renderReadyForm()

    expect(
      screen.getByRole('heading', { name: 'Password Reset' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('New Password')).toHaveFocus()
    expect(screen.getByLabelText('Confirm New Password')).toHaveAttribute(
      'autocomplete',
      'new-password',
    )
  })

  it('waits for a new token and clears the previous password fields', async () => {
    const response = deferred<{ token: string }>()
    const view = await renderReadyForm()
    await fillPasswords()
    vi.mocked(postVerifyPasswordReset).mockReturnValueOnce(response.promise)

    vi.mocked(useLocation).mockReturnValue({
      ...location,
      search: '?token=second',
    })
    view.rerender(<PasswordReset />)

    expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument()
    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
    await act(async () => {
      response.resolve({ token: 'second' })
      await response.promise
    })

    expect(screen.getByLabelText('New Password')).toHaveValue('')
    expect(screen.getByLabelText('Confirm New Password')).toHaveValue('')
    expect(postVerifyPasswordReset).toHaveBeenNthCalledWith(2, 'second')
  })

  it('rechecks a previously visited token before showing its form again', async () => {
    const second = deferred<{ token: string }>()
    const returning = deferred<{ token: string }>()
    const view = await renderReadyForm()
    vi.mocked(postVerifyPasswordReset)
      .mockReturnValueOnce(second.promise)
      .mockReturnValueOnce(returning.promise)

    vi.mocked(useLocation).mockReturnValue({
      ...location,
      search: '?token=second',
    })
    view.rerender(<PasswordReset />)
    vi.mocked(useLocation).mockReturnValue(location)
    view.rerender(<PasswordReset />)

    expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument()
    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
    await act(async () => {
      returning.resolve({ token: 'reset-token' })
      await returning.promise
      second.reject(new Error('Previous link expired'))
      await second.promise.catch(() => undefined)
    })

    expect(screen.getByLabelText('New Password')).toBeInTheDocument()
    expect(postVerifyPasswordReset).toHaveBeenNthCalledWith(3, 'reset-token')
    expect(toast.error).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('ignores a verification failure after leaving the page', async () => {
    const response = deferred<{ token: string }>()
    vi.mocked(postVerifyPasswordReset).mockReturnValue(response.promise)
    const view = render(<PasswordReset />)

    view.unmount()
    await act(async () => {
      response.reject(new Error('Expired link'))
      await response.promise.catch(() => undefined)
    })

    expect(toast.error).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('uses a stable toast ID for a missing token during Strict Mode replay', () => {
    vi.mocked(useLocation).mockReturnValue({ ...location, search: '' })
    render(
      <StrictMode>
        <PasswordReset />
      </StrictMode>,
    )

    expect(postVerifyPasswordReset).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(i18n.t('auth.invalidResetToken'), {
      id: 'password-reset',
    })
    expect(navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('translates rejected verification and returns home', async () => {
    vi.mocked(postVerifyPasswordReset).mockRejectedValue({
      code: AuthErrorCode.InvalidToken,
    })
    render(<PasswordReset />)

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/', { replace: true })
    })
    expect(toast.error).toHaveBeenCalledWith(i18n.t('errors.invalidToken'))
  })

  it('submits the verified token and locks the fields until the request completes', async () => {
    const response = deferred<{ success: boolean }>()
    vi.mocked(postPasswordResetSubmit).mockReturnValue(response.promise)
    await renderReadyForm()
    await fillPasswords()
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(postPasswordResetSubmit).toHaveBeenCalledExactlyOnceWith(
      'reset-token',
      password,
    )
    expect(screen.getByLabelText('New Password')).toBeDisabled()
    expect(screen.getByLabelText('Confirm New Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled()
    await act(async () => {
      response.resolve({ success: true })
      await response.promise
    })

    expect(toast.success).toHaveBeenLastCalledWith(
      i18n.t('auth.passwordChanged'),
    )
    expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
  })

  it('does not submit mismatched passwords', async () => {
    await renderReadyForm()
    await fillPasswords('Different123!')
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    expect(
      await screen.findByText(i18n.t('auth.passwordMismatch')),
    ).toBeInTheDocument()
    expect(postPasswordResetSubmit).not.toHaveBeenCalled()
  })

  it('preserves the form and allows retry after a temporary submission failure', async () => {
    vi.mocked(postPasswordResetSubmit).mockRejectedValueOnce(
      new TypeError('Failed to fetch'),
    )
    await renderReadyForm()
    await fillPasswords()
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()
    })
    expect(toast.error).toHaveBeenCalledWith(i18n.t('auth.passwordChangeError'))
    expect(screen.getByLabelText('New Password')).toHaveValue(password)
    expect(navigate).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
    })
    expect(postPasswordResetSubmit).toHaveBeenCalledTimes(2)
  })

  it('returns to login when the token expires before submission', async () => {
    vi.mocked(postPasswordResetSubmit).mockRejectedValue({
      code: AuthErrorCode.InvalidToken,
    })
    await renderReadyForm()
    await fillPasswords()
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/login', { replace: true })
    })
    expect(toast.error).toHaveBeenCalledWith(i18n.t('errors.invalidToken'))
  })

  it.each(['success', 'failure'] as const)(
    'ignores submission %s after leaving the page',
    async (outcome) => {
      const response = deferred<{ success: boolean }>()
      vi.mocked(postPasswordResetSubmit).mockReturnValue(response.promise)
      const view = await renderReadyForm()
      await fillPasswords()
      await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
      vi.mocked(toast.success).mockClear()
      view.unmount()

      await act(async () => {
        if (outcome === 'success') {
          response.resolve({ success: true })
        } else {
          response.reject(new Error('Request failed'))
        }

        await response.promise.catch(() => undefined)
      })

      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    },
  )

  it('ignores submission completion after switching to another token', async () => {
    const submission = deferred<{ success: boolean }>()
    const verification = deferred<{ token: string }>()
    vi.mocked(postPasswordResetSubmit).mockReturnValue(submission.promise)
    const view = await renderReadyForm()
    await fillPasswords()
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    vi.mocked(toast.success).mockClear()
    vi.mocked(postVerifyPasswordReset).mockReturnValueOnce(verification.promise)
    vi.mocked(useLocation).mockReturnValue({
      ...location,
      search: '?token=second',
    })
    view.rerender(<PasswordReset />)

    await act(async () => {
      submission.resolve({ success: true })
      await submission.promise
    })

    expect(toast.success).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
    expect(screen.queryByLabelText('New Password')).not.toBeInTheDocument()
    await act(async () => {
      verification.resolve({ token: 'second' })
      await verification.promise
    })
  })

  it('uses the current language when a pending submission completes', async () => {
    const response = deferred<{ success: boolean }>()
    vi.mocked(postPasswordResetSubmit).mockReturnValue(response.promise)
    await renderReadyForm()
    await fillPasswords()
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    const englishMessage = i18n.t('auth.passwordChanged')

    await act(() => i18n.changeLanguage('hu'))
    await act(async () => {
      response.resolve({ success: true })
      await response.promise
    })

    expect(i18n.t('auth.passwordChanged')).not.toBe(englishMessage)
    expect(toast.success).toHaveBeenLastCalledWith(
      i18n.t('auth.passwordChanged'),
    )
    expect(postVerifyPasswordReset).toHaveBeenCalledTimes(1)
  })
})
