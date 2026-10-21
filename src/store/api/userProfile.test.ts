import ky from 'ky'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { authRequest } from '@/api/authRequest'
import { PATH } from '@/api/path'
import { UserRole } from '@/types'
import { userSelector } from '../selectors'
import { authSessionChanged } from '../slices/user'
import { createAppStore } from '../store'
import { bookshopApi } from './bookshopApi'

const profile = {
  uuid: '11111111-1111-4111-8111-111111111111',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  country: 'us',
  phone: null,
  address: null,
  avatar: null,
  role: UserRole.User,
}
const fields = { currentPassword: 'WrongPass123!', password: 'NewPass456!' }
const httpResponse = (data: unknown, status = 200) =>
  ky.get('https://bookshop.test/mock', {
    retry: 0,
    fetch: () =>
      Promise.resolve(
        new Response(JSON.stringify(data), {
          status,
          headers: { 'content-type': 'application/json' },
        }),
      ),
  })
let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  store = createAppStore()
  store.dispatch(authSessionChanged('access-token'))
})

afterEach(() => {
  store.dispatch(bookshopApi.util.resetApiState())
  vi.restoreAllMocks()
})

describe('user profile cache', () => {
  it('deduplicates profile reads and derives the user view without a slice copy', async () => {
    const get = vi
      .spyOn(authRequest, 'get')
      .mockImplementation(() => httpResponse(profile))
    const queries = [1, 2].map(() =>
      store.dispatch(
        bookshopApi.endpoints.userProfile.initiate(undefined, {
          subscribe: false,
        }),
      ),
    )

    await Promise.all(queries.map((query) => query.unwrap()))
    expect(get).toHaveBeenCalledTimes(1)
    expect(store.getState().user).not.toHaveProperty('userData')
    expect(userSelector(store.getState()).userData).toEqual(profile)
  })

  it('refreshes the subscribed profile after an account update', async () => {
    const get = vi
      .spyOn(authRequest, 'get')
      .mockImplementation(() => httpResponse(profile))
    const query = store.dispatch(bookshopApi.endpoints.userProfile.initiate())
    await query.unwrap()

    const updated = { ...profile, firstName: 'Updated' }
    get.mockImplementation(() => httpResponse(updated))
    vi.spyOn(authRequest, 'patch').mockImplementation(() =>
      httpResponse(updated),
    )
    const mutation = store.dispatch(
      bookshopApi.endpoints.updateUserProfile.initiate({
        firstName: 'Updated',
      }),
    )
    await mutation.unwrap()

    await vi.waitFor(() => {
      expect(userSelector(store.getState()).userData?.firstName).toBe('Updated')
    })
    expect(get).toHaveBeenCalledTimes(2)
    query.unsubscribe()
    mutation.reset()
  })

  it('preserves the server password code as a serializable mutation failure', async () => {
    const patch = vi
      .spyOn(authRequest, 'patch')
      .mockImplementation(() =>
        httpResponse({ code: 'CURRENT_PASSWORD_INCORRECT' }, 400),
      )
    const mutation = store.dispatch(
      bookshopApi.endpoints.updateUserProfile.initiate(fields),
    )

    await expect(mutation.unwrap()).rejects.toEqual({
      status: 400,
      code: 'CURRENT_PASSWORD_INCORRECT',
      message: 'Your current password is incorrect.',
    })
    expect(patch).toHaveBeenCalledWith(
      PATH.users.profile,
      expect.objectContaining({ json: fields }),
    )
    mutation.reset()
  })

  it('provides a fallback for failures without an error message', async () => {
    vi.spyOn(authRequest, 'patch').mockRejectedValue(undefined)
    const mutation = store.dispatch(
      bookshopApi.endpoints.updateUserProfile.initiate(fields),
    )

    await expect(mutation.unwrap()).rejects.toEqual({
      code: 'UNKNOWN_API_ERROR',
      message: 'Request failed',
    })
    mutation.reset()
  })
})
