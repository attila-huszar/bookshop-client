import ky from 'ky'
import { store, setAccessToken, logout } from '@/store'
import { PATH } from '@/constants'

export const api = ky.create({
  prefixUrl: import.meta.env.VITE_NODE_API_URL,
  headers: {
    credentials: 'include',
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json',
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
        if (response.status === 401) {
          try {
            const refreshResponse = await authApi
              .post<{ accessToken: string }>(`/${PATH.users}/refresh`)
              .json()

            const newAccessToken = refreshResponse.accessToken
            store.dispatch(setAccessToken(newAccessToken))

            return authApi(request)
          } catch {
            store.dispatch(logout())

            return response
          }
        }

        return response
      },
    ],
  },
})
