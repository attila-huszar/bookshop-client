import ky from 'ky'
import { store, setAccessToken, logout } from '@/store'
import { PATH } from '@/constants'

const httpError = {
  Unauthorized: 401,
  TooManyRequests: 429,
}

export const api = ky.create({
  prefixUrl: '/api',
  headers: {
    'Content-Type': 'application/json',
    credentials: 'include',
    'ngrok-skip-browser-warning': 'true',
  },
})

export const authApi = api.extend({
  hooks: {
    beforeRequest: [
      (request) => {
        const accessToken = store.getState().user.accessToken

        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === httpError.Unauthorized) {
          try {
            const refreshResponse = await api
              .post<{ accessToken: string }>(`${PATH.users}/refresh`)
              .json()

            const newAccessToken = refreshResponse.accessToken
            store.dispatch(setAccessToken(newAccessToken))

            return authApi(request)
          } catch {
            store.dispatch(logout())

            return response
          }
        } else if (response.status === httpError.TooManyRequests) {
          throw new Error('Request aborted due to too many requests')
        }

        return response
      },
    ],
  },
})
