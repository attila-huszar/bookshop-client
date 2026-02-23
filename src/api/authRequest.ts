import { fetchAuthTokens, store } from '@/store'
import { baseRequest } from './baseRequest'

const httpError = {
  Unauthorized: 401,
  TooManyRequests: 429,
}

let refreshPromise: Promise<unknown> | null = null

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
      async (request, options, response) => {
        const authRetryAttempted = options.context.authRetryAttempted === true

        if (response.status === httpError.Unauthorized && !authRetryAttempted) {
          try {
            refreshPromise ??= store.dispatch(fetchAuthTokens())
            await refreshPromise
          } finally {
            refreshPromise = null
          }

          const accessToken = store.getState().user.accessToken

          if (accessToken) {
            return authRequest(request, {
              context: {
                ...options.context,
                authRetryAttempted: true,
              },
            })
          }
        } else if (response.status === httpError.TooManyRequests) {
          throw new Error('Request aborted due to too many requests')
        }

        return response
      },
    ],
  },
})
