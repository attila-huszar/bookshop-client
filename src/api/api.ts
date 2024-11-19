import ky from 'ky'
import { store, fetchTokens } from '@/store'

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
          await store.dispatch(fetchTokens())

          if (store.getState().user.accessToken) {
            return api(request)
          }
        } else if (response.status === httpError.TooManyRequests) {
          throw new Error('Request aborted due to too many requests')
        }

        return response
      },
    ],
  },
})
