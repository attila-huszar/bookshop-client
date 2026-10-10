import { baseRequest } from './baseRequest'

type AuthSession = {
  getAccessToken: () => string | null
  refresh: () => Promise<{ accessToken: string | null }>
  expire: (accessToken: string) => void
}

let authSession: AuthSession | undefined

/** Bind authentication at startup, rather than importing the store into the API layer. */
export function configureAuthRequest(session: AuthSession): void {
  authSession = session
}

let refreshPromise: ReturnType<AuthSession['refresh']> | null = null

export const authRequest = baseRequest.extend({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const accessToken = authSession?.getAccessToken()

        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`)
        }
      },
    ],
    afterResponse: [
      async ({ request, options, response }) => {
        const authRetryAttempted = options.context.authRetryAttempted === true

        if (response.status !== 401 || !authSession) {
          return response
        }

        const session = authSession
        const accessToken = session.getAccessToken()
        const authorization = accessToken ? `Bearer ${accessToken}` : null

        // Responses from a previous session must not refresh or expire this one.
        if (request.headers.get('Authorization') !== authorization) {
          return response
        }

        if (authRetryAttempted) {
          if (accessToken) {
            session.expire(accessToken)
          }

          return response
        }

        refreshPromise ??= session.refresh().finally(() => {
          refreshPromise = null
        })
        const tokens = await refreshPromise

        if (
          tokens.accessToken &&
          session === authSession &&
          tokens.accessToken === session.getAccessToken()
        ) {
          return authRequest(request, {
            retry: options.retry,
            context: {
              ...options.context,
              authRetryAttempted: true,
            },
          })
        }

        return response
      },
    ],
  },
})
