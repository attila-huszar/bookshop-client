import { vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router'
import { toast } from 'react-hot-toast'
import { PasswordReset } from './PasswordReset'
import { updateUser } from '@/store'

vi.mock('@/api/apiHandler', () => ({
  apiHandler: {
    passwordReset: vi.fn(),
  },
}))

vi.mock('@/store', () => ({
  updateUser: vi.fn(),
}))

vi.mock('@/hooks', () => ({
  useAppDispatch: () => vi.fn(),
}))

describe('PasswordReset Component', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('should render the form if reset code is valid', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?code=123',
    } as unknown as ReturnType<typeof useLocation>)

    //vi.mocked(passwordReset).mockResolvedValue('mock-uuid')

    render(
      <MemoryRouter initialEntries={['/password-reset?code=123']}>
        <Routes>
          <Route path="/password-reset" element={<PasswordReset />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      //expect(passwordReset).toHaveBeenCalledWith('123')

      expect(screen.getByText(/Password Reset/i)).toBeInTheDocument()
    })
  })

  it('should display an error notification if reset code is invalid and navigate to home', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?code=invalid',
    } as unknown as ReturnType<typeof useLocation>)

    // vi.mocked(passwordReset).mockRejectedValue(
    //   new Error('Invalid reset code'),
    // )

    render(
      <MemoryRouter initialEntries={['/password-reset?code=invalid']}>
        <Routes>
          <Route path="/" element={<div>Home</div>} />
          <Route path="/password-reset" element={<PasswordReset />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      //expect(passwordReset).toHaveBeenCalledWith('invalid')

      expect(toast.error).toHaveBeenCalledWith('Invalid reset code', {
        id: 'reset-error',
      })

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
    })
  })

  it('should submit new password and display success notification and navigate to login page if code is valid', async () => {
    vi.mocked(useLocation).mockReturnValue({
      search: '?code=123',
    } as unknown as ReturnType<typeof useLocation>)

    //vi.mocked(passwordReset).mockResolvedValue('mock-uuid')

    render(
      <MemoryRouter initialEntries={['/password-reset?code=123']}>
        <Routes>
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    )

    // await waitFor(() => {
    //   expect(passwordReset).toHaveBeenCalledWith('123')
    // })

    const password = 'NewPass123'

    const newPasswordInput = screen.getByPlaceholderText(/^new password$/i)
    const confirmPasswordInput =
      screen.getByPlaceholderText(/confirm new password/i)
    const submitButton = screen.getByRole('button', { name: /submit/i })

    await userEvent.type(newPasswordInput, password)
    await userEvent.type(confirmPasswordInput, password)
    await userEvent.click(submitButton)

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({
        fields: {
          password,
        },
        uuid: 'mock-uuid',
      })

      expect(toast.success).toHaveBeenCalledWith(
        'Password Changed Successfully',
        { id: 'reset-success' },
      )

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
    })
  })
})
