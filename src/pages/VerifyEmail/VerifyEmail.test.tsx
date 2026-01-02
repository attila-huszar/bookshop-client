import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useLocation, useNavigate } from 'react-router'
import { VerifyEmail } from './VerifyEmail'

describe('VerifyEmail Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('should render loading state when token is present', () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=validCode',
      pathname: '/verification',
      hash: '',
      state: null,
      key: 'default',
    })

    render(<VerifyEmail />)

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
  })

  it('should render loading state when token is invalid', () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?token=invalidCode',
      pathname: '/verification',
      hash: '',
      state: null,
      key: 'default',
    })

    render(<VerifyEmail />)

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
  })

  it('should render loading state when token is missing', () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '',
      pathname: '/verification',
      hash: '',
      state: null,
      key: 'default',
    })

    render(<VerifyEmail />)

    expect(screen.getByText(/verifying/i)).toBeInTheDocument()
  })
})
