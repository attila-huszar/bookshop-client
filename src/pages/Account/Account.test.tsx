import { Providers } from '@/setupTests'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { vi } from 'vitest'
import { useAppDispatch, useAppSelector } from '@/hooks'
import { Account } from './Account'

vi.mock('@/services', () => ({
  uploadImage: vi.fn(),
}))

vi.mock('@/store', () => ({
  userSelector: vi.fn(),
  updateUser: vi.fn(),
  updateAvatar: vi.fn(),
}))

vi.mock('@/components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components')>()
  return {
    ...actual,
    CountrySelect: () => <div>Country Select Mock</div>,
  }
})

vi.mock(import('react-hot-toast'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
  }
})

describe('Account page', () => {
  const mockDispatch = vi.fn(() =>
    Promise.resolve({ url: 'mock-avatar-url', meta: {} }),
  ) as unknown as ReturnType<typeof useAppDispatch>

  beforeEach(() => {
    vi.mocked(useAppSelector).mockReturnValue({
      userData: {
        firstName: 'July',
        email: 'july@test.com',
        avatar: 'avatar_url',
        address: {
          line1: '',
          line2: '',
          city: '',
          postcode: '',
          country: 'GB',
        },
      },
      userIsUpdating: false,
    })
    vi.mocked(useAppDispatch).mockReturnValue(mockDispatch)
  })

  it('should render the account page with user information', () => {
    render(<Account />, { wrapper: Providers })

    expect(screen.getByRole('heading', { name: /hello/i })).toBeInTheDocument()
    expect(screen.getByText(/general information/i)).toBeInTheDocument()
    expect(screen.getByText(/address line 1/i)).toBeInTheDocument()
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
      expect(screen.getByPlaceholderText(/first name/i)).toHaveValue(
        'UpdatedName',
      )
    })
  })

  it('should handle avatar image change correctly', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    render(<Account />, { wrapper: Providers })

    const avatarButton = screen.getByTitle(/change profile picture/i)
    await userEvent.click(avatarButton)

    const fileInput = screen.getByLabelText(/Change avatar/i)
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

    const addressLine1Field = screen.getByPlaceholderText(/address line 1/i)
    expect(addressLine1Field).not.toHaveAttribute('readonly')
  })

  it('should submit updated address information when save is clicked', async () => {
    render(<Account />, { wrapper: Providers })

    const editButton = screen.getByRole('button', { name: /edit address/i })
    await userEvent.click(editButton)

    const addressLine1Field = screen.getByPlaceholderText(/address line 1/i)
    await userEvent.clear(addressLine1Field)
    await userEvent.type(addressLine1Field, 'Updated Address')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await userEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/address line 1/i)).toHaveValue(
        'Updated Address',
      )
    })
  })
})
