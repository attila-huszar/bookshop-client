import ky from 'ky'
import { authRequest, PATH } from '@/api'
import { updateUserProfile } from './user'

describe('updateUserProfile', () => {
  const fields = {
    currentPassword: 'WrongPass123!',
    password: 'NewPass456!',
  }

  it('preserves the server password error in the rejected Redux action', async () => {
    const patch = vi.spyOn(authRequest, 'patch').mockImplementation(() =>
      ky.patch('https://bookshop.test/users/profile', {
        retry: 0,
        fetch: () =>
          Promise.resolve(
            new Response(
              JSON.stringify({ error: 'Current password is incorrect' }),
              {
                status: 400,
                headers: { 'content-type': 'application/json' },
              },
            ),
          ),
      }),
    )

    const action = await updateUserProfile(fields)(vi.fn(), vi.fn(), undefined)

    expect(patch).toHaveBeenCalledWith(PATH.users.profile, { json: fields })
    expect(action).toMatchObject({
      type: 'user/updateUserProfile/rejected',
      error: { message: 'Current password is incorrect' },
    })
  })

  it('provides a fallback for failures without an error message', async () => {
    vi.spyOn(authRequest, 'patch').mockRejectedValue(undefined)

    const action = await updateUserProfile(fields)(vi.fn(), vi.fn(), undefined)

    expect(action).toMatchObject({
      type: 'user/updateUserProfile/rejected',
      error: {
        message: 'Failed to update user profile, please try again later',
      },
    })
  })
})
