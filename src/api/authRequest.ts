import { baseRequest } from './baseRequest'
import { store, fetchAuthTokens } from '@/store'

const httpError = {
  Unauthorized: 401,
  TooManyRequests: 429,
}

export const authRequest = baseRequest.extend({
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
          await store.dispatch(fetchAuthTokens())

          const accessToken = store.getState().user.accessToken

          if (accessToken) {
            return authRequest(request)
          }
        } else if (response.status === httpError.TooManyRequests) {
          throw new Error('Request aborted due to too many requests')
        }

        return response
      },
    ],
  },
})
