import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useAddUserMutation, useUpdateUserMutation } from '@/store/api/usersApi'
import { type CmsUser, SignInMethod, UserRole } from '@/types'
import { UserEditForm } from './UserEditForm'

vi.mock('@/store/api/usersApi', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/store/api/usersApi')>()),
  useAddUserMutation: vi.fn(),
  useUpdateUserMutation: vi.fn(),
}))

vi.mock('@/components/CountrySelect', () => ({
  CountrySelect: () => null,
}))

const account: CmsUser = {
  id: 1,
  uuid: '11111111-1111-4111-8111-111111111111',
  firstName: 'Reader',
  lastName: 'One',
  email: 'reader@example.com',
  country: 'hu',
  role: UserRole.User,
  phone: '',
  address: null,
  avatar: '',
  verified: true,
  signInMethods: [SignInMethod.Password, SignInMethod.Google],
  createdAt: '2026-10-08T10:00:00Z',
  updatedAt: '2026-10-08T10:00:00Z',
  deletedAt: null,
}

const addUser = vi.fn()
const updateUser = vi.fn()

beforeEach(() => {
  addUser.mockReturnValue({ unwrap: () => Promise.resolve(account) })
  updateUser.mockReturnValue({ unwrap: () => Promise.resolve(account) })
  vi.mocked(useAddUserMutation).mockReturnValue([addUser, { reset: vi.fn() }])
  vi.mocked(useUpdateUserMutation).mockReturnValue([
    updateUser,
    { reset: vi.fn() },
  ])
})

it.each([
  { signInMethods: [SignInMethod.Password], text: 'Password' },
  { signInMethods: [SignInMethod.Google], text: 'Google' },
  {
    signInMethods: [SignInMethod.Password, SignInMethod.Google],
    text: 'Password, Google',
  },
] satisfies { signInMethods: CmsUser['signInMethods']; text: string }[])(
  'shows configured sign-in methods as read-only metadata: $text',
  ({ signInMethods, text }) => {
    render(
      <UserEditForm
        editedItem={{ ...account, signInMethods }}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByLabelText('Sign-in methods')).toHaveTextContent(text)
    expect(screen.getByRole('combobox', { name: 'Role' })).toHaveValue('user')
    expect(
      screen.queryByRole('textbox', { name: 'Sign-in methods' }),
    ).not.toBeInTheDocument()
  },
)

it('updates the role without submitting authentication metadata', async () => {
  render(<UserEditForm editedItem={account} onClose={vi.fn()} />)
  await userEvent.selectOptions(
    screen.getByRole('combobox', { name: 'Role' }),
    'admin',
  )
  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  await waitFor(() => expect(updateUser).toHaveBeenCalledOnce())

  expect(updateUser).toHaveBeenCalledWith(
    expect.objectContaining({ uuid: account.uuid, role: UserRole.Admin }),
  )
  expect(updateUser.mock.calls[0]![0]).not.toHaveProperty('signInMethods')
  expect(updateUser.mock.calls[0]![0]).not.toHaveProperty('password')
})

it('does not show sign-in metadata while creating an account', () => {
  render(<UserEditForm editedItem={null} onClose={vi.fn()} />)

  expect(screen.queryByLabelText('Sign-in methods')).not.toBeInTheDocument()
})
