import { Providers } from '@/testUtils'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import {
  useUpdateAvatarMutation,
  useUpdateUserProfileMutation,
} from '@/store/api/usersApi'
import { useAppSelector } from '@/hooks/redux'
import { Account } from './Account'

vi.mock('@/hooks/redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/redux')>()),
  useAppSelector: vi.fn(),
}))

vi.mock('@/store/selectors', () => ({
  userSelector: vi.fn(),
}))

vi.mock('@/store/api/usersApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/usersApi')>()),
  useUpdateAvatarMutation: vi.fn(),
  useUpdateUserProfileMutation: vi.fn(),
}))

vi.mock('@/components/CountrySelect', () => ({
  CountrySelect: () => <div>Country Select Mock</div>,
}))

describe('Account page', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    vi.mocked(useAppSelector).mockReturnValue({
      userData: {
        firstName: 'July',
        lastName: 'Reader',
        email: 'july@test.com',
        phone: null,
        avatar: 'avatar_url',
        address: {
          line1: '1 Reading Lane',
          line2: '',
          city: 'London',
          state: '',
          postal_code: 'SW1A 1AA',
          country: 'GB',
        },
      },
    })
    vi.mocked(useUpdateUserProfileMutation).mockReturnValue([
      mockDispatch,
      { isLoading: false, reset: vi.fn() },
    ])
    vi.mocked(useUpdateAvatarMutation).mockReturnValue([
      mockDispatch,
      { isLoading: false, reset: vi.fn() },
    ])
  })

  it('should render the account page with user information', () => {
    render(<Account />, { wrapper: Providers })

    expect(screen.getByRole('heading', { name: /hello/i })).toBeInTheDocument()
    expect(screen.getByText(/general information/i)).toBeInTheDocument()
    expect(screen.getByText(/^line 1$/i)).toBeInTheDocument()
  })

  it('shows loading while the account profile is unavailable', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      userData: null,
      userIsLoading: true,
      userError: null,
    })

    render(<Account />, { wrapper: Providers })

    expect(screen.getByText('Loading your account')).toBeInTheDocument()
    expect(
      screen.queryByText('Could not load your account'),
    ).not.toBeInTheDocument()
  })

  it('shows a failed profile request instead of leaving the account blank', () => {
    vi.mocked(useAppSelector).mockReturnValue({
      userData: null,
      userIsLoading: false,
      userError: 'Network unavailable',
    })

    render(<Account />, { wrapper: Providers })

    expect(screen.getByText('Could not load your account')).toBeInTheDocument()
    expect(screen.getByText('Network unavailable')).toBeInTheDocument()
  })

  it('should enable editing the general information section when edit is clicked', async () => {
    render(<Account />, { wrapper: Providers })

    const editButton = screen.getByRole('button', { name: /edit contact/i })
    await userEvent.click(editButton)

    const firstNameField = screen.getByPlaceholderText(/first name/i)
    expect(firstNameField).not.toHaveAttribute('readonly')
  })

  it('should submit updated general information when save is clicked', async () => {
    render(<Account />, { wrapper: Providers })

    const editButton = screen.getByRole('button', { name: /edit contact/i })
    await userEvent.click(editButton)

    const firstNameField = screen.getByPlaceholderText(/first name/i)
    await userEvent.clear(firstNameField)
    await userEvent.type(firstNameField, 'UpdatedName')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        firstName: 'UpdatedName',
        lastName: 'Reader',
        phone: '',
      })
    })
  })

  it('should handle avatar image change correctly', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    render(<Account />, { wrapper: Providers })

    const avatarButton = screen.getByTitle(/change profile picture/i)
    await userEvent.click(avatarButton)

    const fileInput = screen.getByLabelText(/Change Profile Picture/i)
    await userEvent.upload(fileInput, file)

    // Avatar upload triggers dispatch with the file
    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled()
    })
  })

  it('should enable editing the address section when edit is clicked', async () => {
    render(<Account />, { wrapper: Providers })

    const editButton = screen.getByRole('button', { name: /edit address/i })
    await userEvent.click(editButton)

    const addressLine1Field = screen.getByPlaceholderText(/^line 1$/i)
    expect(addressLine1Field).not.toHaveAttribute('readonly')
  })

  it('submits a saved address without an optional county/state', async () => {
    render(<Account />, { wrapper: Providers })

    const editButton = screen.getByRole('button', { name: /edit address/i })
    await userEvent.click(editButton)

    const addressLine1Field = screen.getByPlaceholderText(/^line 1$/i)
    await userEvent.clear(addressLine1Field)
    await userEvent.type(addressLine1Field, 'Updated Address')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        address: {
          line1: 'Updated Address',
          line2: '',
          city: 'London',
          state: '',
          postal_code: 'SW1A 1AA',
          country: 'GB',
        },
      })
    })
  })

  it('shows required address errors and keeps the form editable without submitting', async () => {
    const user = userEvent.setup()
    render(<Account />, { wrapper: Providers })

    await user.click(screen.getByRole('button', { name: /edit address/i }))
    await user.clear(screen.getByPlaceholderText(/^line 1$/i))
    await user.clear(screen.getByPlaceholderText(/^city$/i))
    await user.clear(screen.getByPlaceholderText(/postal code/i))
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(await screen.findAllByText('Required')).toHaveLength(3)
    expect(mockDispatch).not.toHaveBeenCalled()
    expect(screen.getByText('State (optional)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^state$/i)).toHaveValue('')
    expect(screen.getByPlaceholderText(/^line 1$/i)).not.toHaveAttribute(
      'readonly',
    )
    expect(screen.getByRole('button', { name: /cancel/i })).toBeEnabled()
  })
})
