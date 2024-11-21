import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { VerifyEmail } from './VerifyEmail'
import { postVerifyEmail } from '@/api/users'

vi.mock('@/api/users', () => ({
  postVerifyEmail: vi.fn(),
}))

describe('VerifyEmail Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('should call postVerifyEmail API and navigate to login on success', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=validCode',
    } as unknown as ReturnType<typeof useLocation>)

    vi.mocked(postVerifyEmail).mockResolvedValue({
      email: expect.any(String) as string,
    })

    render(<VerifyEmail />)

    await waitFor(() => {
      expect(postVerifyEmail).toHaveBeenCalledWith('validCode')

      expect(toast.success).toHaveBeenCalledWith(/successfully verified/i, {
        id: 'verify-success',
      })

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  it('should show error and navigate to home on failure', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=invalidCode',
    } as unknown as ReturnType<typeof useLocation>)

    vi.mocked(postVerifyEmail).mockRejectedValue(
      new Error('Verification failed'),
    )

    render(<VerifyEmail />)

    await waitFor(() => {
      expect(postVerifyEmail).toHaveBeenCalledWith('invalidCode')

      expect(toast.error).toHaveBeenCalledWith('Verification failed', {
        id: 'verify-error',
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should not call postVerifyEmail API if code is missing', () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '',
    } as unknown as ReturnType<typeof useLocation>)

    render(<VerifyEmail />)

    expect(postVerifyEmail).not.toHaveBeenCalled()

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
  })
})
