import { StrictMode } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { postVerifyEmail } from '@/api/users'
import { AuthErrorCode } from '@/types/ApiError'
import { VerifyEmail } from './VerifyEmail'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
}))

vi.mock('@/api/users', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/users')>()),
  postVerifyEmail: vi.fn(),
}))

describe('VerifyEmail', () => {
  const navigate = vi.fn()
  const location = {
    search: '?token=first-token',
    pathname: '/verification',
    hash: '',
    state: null,
    key: 'default',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(navigate)
    vi.mocked(useLocation).mockReturnValue(location)
    vi.mocked(postVerifyEmail).mockReset()
  })

  it('handles a missing token instead of loading forever', () => {
    vi.mocked(useLocation).mockReturnValue({ ...location, search: '' })
    render(<VerifyEmail />)

    expect(screen.queryByText(/verifying/i)).not.toBeInTheDocument()
    expect(postVerifyEmail).not.toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      'This link is invalid or has expired. Please request a new one.',
      { id: 'verify' },
    )
    expect(navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it('allows Strict Mode effect replay and processes only the active result', async () => {
    let complete!: (value: { email: string }) => void
    const response = new Promise<{ email: string }>((resolve) => {
      complete = resolve
    })
    vi.mocked(postVerifyEmail).mockReturnValue(response)
    render(
      <StrictMode>
        <VerifyEmail />
      </StrictMode>,
    )

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
    expect(postVerifyEmail).toHaveBeenCalledTimes(2)
    expect(postVerifyEmail).toHaveBeenNthCalledWith(1, 'first-token')
    expect(postVerifyEmail).toHaveBeenNthCalledWith(2, 'first-token')
    expect(navigate).not.toHaveBeenCalled()

    await act(async () => {
      complete({ email: 'reader@example.com' })
      await response
    })

    expect(postVerifyEmail).toHaveBeenCalledTimes(2)
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/login', {
      replace: true,
    })
    expect(toast.success).toHaveBeenCalledTimes(1)
  })

  it('translates a rejected token and returns home', async () => {
    vi.mocked(postVerifyEmail).mockRejectedValue({
      code: AuthErrorCode.InvalidToken,
    })
    render(<VerifyEmail />)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'This link is invalid or has expired. Please request a new one.',
        { id: 'verify' },
      )
    })
    expect(navigate).toHaveBeenCalledWith('/', { replace: true })
  })

  it.each(['success', 'failure'] as const)(
    'ignores verification %s after leaving the page',
    async (outcome) => {
      let complete!: (value: { email: string }) => void
      let fail!: (error: Error) => void
      const response = new Promise<{ email: string }>((resolve, reject) => {
        complete = resolve
        fail = reject
      })
      vi.mocked(postVerifyEmail).mockReturnValue(response)
      const view = render(<VerifyEmail />)

      view.unmount()
      await act(async () => {
        if (outcome === 'success') {
          complete({ email: 'reader@example.com' })
        } else {
          fail(new Error('Previous verification failed'))
        }

        await response.catch(() => undefined)
      })

      expect(navigate).not.toHaveBeenCalled()
      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
    },
  )

  it.each(['success', 'failure'] as const)(
    'verifies a new URL token and ignores the previous pending %s',
    async (outcome) => {
      let completeFirst!: (value: { email: string }) => void
      let failFirst!: (error: Error) => void
      const firstResponse = new Promise<{ email: string }>(
        (resolve, reject) => {
          completeFirst = resolve
          failFirst = reject
        },
      )
      vi.mocked(postVerifyEmail)
        .mockReturnValueOnce(firstResponse)
        .mockResolvedValueOnce({ email: 'new@example.com' })
      const view = render(<VerifyEmail />)

      vi.mocked(useLocation).mockReturnValue({
        ...location,
        search: '?token=second-token',
      })
      view.rerender(<VerifyEmail />)
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledTimes(1)
      })

      await act(async () => {
        if (outcome === 'success') {
          completeFirst({ email: 'previous@example.com' })
        } else {
          failFirst(new Error('Previous link expired'))
        }

        await firstResponse.catch(() => undefined)
      })

      expect(postVerifyEmail).toHaveBeenNthCalledWith(2, 'second-token')
      expect(navigate).toHaveBeenCalledExactlyOnceWith('/login', {
        replace: true,
      })
      expect(toast.error).not.toHaveBeenCalled()
    },
  )

  it('keeps a missing-token error when an older verification completes', async () => {
    let complete!: (value: { email: string }) => void
    const response = new Promise<{ email: string }>((resolve) => {
      complete = resolve
    })
    vi.mocked(postVerifyEmail).mockReturnValue(response)
    const view = render(<VerifyEmail />)

    vi.mocked(useLocation).mockReturnValue({ ...location, search: '' })
    view.rerender(<VerifyEmail />)
    await act(async () => {
      complete({ email: 'previous@example.com' })
      await response
    })

    expect(navigate).toHaveBeenCalledExactlyOnceWith('/', { replace: true })
    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.success).not.toHaveBeenCalled()
    expect(screen.queryByText(/verifying/i)).not.toBeInTheDocument()
  })

  it('uses the current language without restarting a pending verification', async () => {
    let complete!: (value: { email: string }) => void
    const response = new Promise<{ email: string }>((resolve) => {
      complete = resolve
    })
    vi.mocked(postVerifyEmail).mockReturnValue(response)
    render(<VerifyEmail />)

    await act(() => i18n.changeLanguage('hu'))

    expect(screen.getByText(i18n.t('auth.verifying'))).toBeInTheDocument()
    expect(postVerifyEmail).toHaveBeenCalledExactlyOnceWith('first-token')
    await act(async () => {
      complete({ email: 'reader@example.com' })
      await response
    })

    expect(toast.success).toHaveBeenCalledExactlyOnceWith(
      i18n.t('auth.verified', { email: 'reader@example.com' }),
      { id: 'verify' },
    )
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/login', {
      replace: true,
    })
  })
})
