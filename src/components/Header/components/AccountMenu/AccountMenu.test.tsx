import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { AccountMenu } from './AccountMenu'
import { useAppDispatch, useAppSelector, useLocalStorage } from '@/hooks'
import { logout } from '@/store'
import { Providers } from '@/setupTests'

describe('AccountMenu component', () => {
  const mockNavigate = vi.fn()
  const mockDispatch = vi.fn(() => ({
    unwrap: () => Promise.resolve(),
  })) as unknown as ReturnType<typeof useAppDispatch>
  const mockRemoveFromLocalStorage = vi.fn()

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
    vi.mocked(useAppSelector).mockReturnValue({
      userData: {
        firstName: 'July',
        email: 'july@test.com',
        avatar: 'avatar_url',
      },
    })
    vi.mocked(useLocalStorage).mockReturnValue({
      getFromLocalStorage: vi.fn(),
      setToLocalStorage: vi.fn(),
      removeFromLocalStorage: mockRemoveFromLocalStorage,
    })
    mockRemoveFromLocalStorage.mockClear()
    vi.spyOn(toast, 'success').mockImplementation(() => '')
    vi.spyOn(toast, 'error').mockImplementation(() => '')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should render the user avatar when logged in and open the menu on click', async () => {
    render(<AccountMenu />, { wrapper: Providers })

    const avatar = screen.getByTitle('July')
    expect(avatar).toBeInTheDocument()

    await userEvent.click(avatar)
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should call navigate to login when not logged in', async () => {
    vi.mocked(useAppSelector).mockReturnValue({ userData: null })
    render(<AccountMenu />, { wrapper: Providers })

    const loginButton = screen.getByTitle('Login/Register')
    await userEvent.click(loginButton)

    expect(mockNavigate).toHaveBeenCalledWith('login')
  })

  it('should handle logout when clicking logout', async () => {
    render(<AccountMenu />, { wrapper: Providers })

    await userEvent.click(screen.getByTitle('July'))
    await userEvent.click(screen.getByText('Logout'))

    expect(mockRemoveFromLocalStorage).toHaveBeenCalledWith('uuid')
    expect(toast.success).toHaveBeenCalledWith(
      'july@test.com successfully logged out',
    )
    expect(mockDispatch).toHaveBeenCalledWith(logout())
  })
})
