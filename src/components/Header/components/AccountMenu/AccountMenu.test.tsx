import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router'
import { Providers } from '@/testUtils'
import { render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { AccountMenu } from './AccountMenu'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

vi.mock('@/hooks/redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/redux')>()),
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
}))

describe('AccountMenu component', () => {
  const mockNavigate = vi.fn()
  const mockDispatch = vi.fn(() => ({
    unwrap: () => Promise.resolve(),
  }))

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useAppDispatch).mockReturnValue(
      mockDispatch as unknown as ReturnType<typeof useAppDispatch>,
    )
    vi.mocked(useAppSelector).mockReturnValue({
      accessToken: 'mock-token',
      userData: {
        firstName: 'July',
        email: 'july@test.com',
        avatar: 'avatar_url',
      },
    })
    vi.spyOn(toast, 'success').mockImplementation(() => '')
    vi.spyOn(toast, 'error').mockImplementation(() => '')
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('should render the user avatar when logged in and open the menu on click', async () => {
    render(<AccountMenu />, { wrapper: Providers })

    const avatar = screen.getByTitle('July')
    expect(avatar).toBeInTheDocument()

    await userEvent.click(avatar)
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it.each([390, 1280])(
    'switches language and flag from the account menu at %ipx and remembers the choice',
    async (width) => {
      vi.stubGlobal('innerWidth', width)
      localStorage.removeItem('language')
      render(<AccountMenu />, { wrapper: Providers })
      await userEvent.click(screen.getByTitle('July'))
      const english = screen.getByRole('button', { name: 'Switch to Magyar' })
      expect(english).toHaveTextContent('English')
      expect(within(english).getByAltText('')).toHaveAttribute(
        'src',
        'https://flagcdn.com/gb.svg',
      )
      await userEvent.click(english)

      const hungarian = screen.getByRole('button', { name: 'Váltás: English' })
      expect(hungarian).toHaveTextContent('Magyar')
      expect(within(hungarian).getByAltText('')).toHaveAttribute(
        'src',
        'https://flagcdn.com/hu.svg',
      )
      expect(localStorage.getItem('language')).toBe('hu')
      expect(document.documentElement.lang).toBe('hu')
      await userEvent.click(hungarian)

      expect(document.documentElement.lang).toBe('en')
      expect(localStorage.getItem('language')).toBe('en')
      expect(
        screen.getByRole('button', { name: 'Switch to Magyar' }),
      ).toHaveTextContent('English')
      expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    },
  )

  it.each([390, 1280])(
    'uses a single flag icon and retains login navigation for guests at %ipx',
    async (width) => {
      vi.stubGlobal('innerWidth', width)
      localStorage.removeItem('language')
      vi.mocked(useAppSelector).mockReturnValue({
        accessToken: null,
        userData: null,
      })
      render(<AccountMenu />, { wrapper: Providers })

      const loginButton = screen.getByTitle('Login/Register')
      const languageButton = screen.getByRole('button', {
        name: 'Switch to Magyar',
      })
      expect(
        screen.queryByRole('button', { name: 'English' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Magyar' }),
      ).not.toBeInTheDocument()
      expect(within(languageButton).getByAltText('')).toHaveAttribute(
        'src',
        'https://flagcdn.com/gb.svg',
      )
      await userEvent.click(languageButton)

      const hungarian = screen.getByRole('button', { name: 'Váltás: English' })
      expect(within(hungarian).getByAltText('')).toHaveAttribute(
        'src',
        'https://flagcdn.com/hu.svg',
      )
      expect(localStorage.getItem('language')).toBe('hu')
      await userEvent.click(hungarian)
      expect(localStorage.getItem('language')).toBe('en')
      await userEvent.click(loginButton)

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    },
  )

  it('should handle logout when clicking logout', async () => {
    render(<AccountMenu />, { wrapper: Providers })

    await userEvent.click(screen.getByTitle('July'))
    await userEvent.click(screen.getByText('Logout'))

    expect(mockDispatch).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith(
      'july@test.com successfully logged out',
      { id: 'logout-success' },
    )
  })

  it('keeps the menu open and translates logout failures without navigating away', async () => {
    mockDispatch.mockReturnValueOnce({
      unwrap: () =>
        Promise.reject(
          Object.assign(new Error('Untranslated server message'), {
            code: 'REQUEST_TIMEOUT',
          }),
        ),
    })
    render(<AccountMenu />, { wrapper: Providers })

    await userEvent.click(screen.getByTitle('July'))
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'The request timed out. Please try again.',
        { id: 'logout-error' },
      )
    })
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(screen.getByText('Orders')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Logout' })).toBeEnabled()
  })
})
