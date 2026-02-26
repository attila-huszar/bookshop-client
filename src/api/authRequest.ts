import { fetchAuthTokens, store } from '@/store'
import { baseRequest } from './baseRequest'

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

        if (response.status === 401 && !authRetryAttempted) {
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
        }

        return response
      },
    ],
  },
})
