import { baseRequest } from './baseRequest'

type AuthSession = {
  getAccessToken: () => string | null
  getSessionVersion: () => number
  refresh: () => Promise<{ accessToken: string | null }>
  expire: (accessToken: string) => void
}

let authSession: AuthSession | undefined

/** Bind authentication at startup, rather than importing the store into the API layer. */
export function configureAuthRequest(session: AuthSession): void {
  authSession = session
}

type PendingRefresh = {
  session: AuthSession
  version: number
  promise: ReturnType<AuthSession['refresh']>
}

let pendingRefresh: PendingRefresh | null = null

export const authRequest = baseRequest.extend({
  hooks: {
    beforeRequest: [
      ({ request, options }) => {
        const accessToken = authSession?.getAccessToken()
        options.context.sessionVersion = authSession?.getSessionVersion()

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
        const version = session.getSessionVersion()
        const accessToken = session.getAccessToken()
        const authorization = accessToken ? `Bearer ${accessToken}` : null

        // Responses from a previous session must not refresh or expire this one.
        if (
          request.headers.get('Authorization') !== authorization ||
          options.context.sessionVersion !== version
        ) {
          return response
        }

        if (authRetryAttempted) {
          if (accessToken) {
            session.expire(accessToken)
          }

          return response
        }

        if (
          pendingRefresh?.session !== session ||
          pendingRefresh.version !== version
        ) {
          const pending: PendingRefresh = {
            session,
            version,
            promise: session.refresh().finally(() => {
              if (pendingRefresh === pending) {
                pendingRefresh = null
              }
            }),
          }
          pendingRefresh = pending
        }

        const tokens = await pendingRefresh.promise

        if (
          tokens.accessToken &&
          session === authSession &&
          version === session.getSessionVersion() &&
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
