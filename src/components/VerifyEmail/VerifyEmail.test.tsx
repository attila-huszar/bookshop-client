import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { VerifyEmail } from './VerifyEmail'

vi.mock('@/api/users', () => ({
  verifyEmail: vi.fn(),
}))

describe('VerifyEmail Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('should call verifyEmail API and navigate to login on success', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?code=validCode',
    } as unknown as ReturnType<typeof useLocation>)

    vi.mocked(verifyEmail).mockResolvedValue('Verification successful')

    render(<VerifyEmail />)

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith('validCode')

      expect(toast.success).toHaveBeenCalledWith('Verification successful', {
        id: 'verify-success',
      })

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })

  it('should show error and navigate to home on failure', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?code=invalidCode',
    } as unknown as ReturnType<typeof useLocation>)

    vi.mocked(verifyEmail).mockRejectedValue(new Error('Verification failed'))

    render(<VerifyEmail />)

    await waitFor(() => {
      expect(verifyEmail).toHaveBeenCalledWith('invalidCode')

      expect(toast.error).toHaveBeenCalledWith('Verification failed', {
        id: 'verify-error',
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should not call verifyEmail API if code is missing', () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '',
    } as unknown as ReturnType<typeof useLocation>)

    render(<VerifyEmail />)

    expect(verifyEmail).not.toHaveBeenCalled()

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
  })
})
