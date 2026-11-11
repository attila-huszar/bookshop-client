import { createAsyncThunk } from '@reduxjs/toolkit'
import { postUserLogin, postUserLogout, retrieveAuthTokens } from '@/api/users'
import { resetCheckout } from '@/store/thunks/checkout'
import { sessionRetryPolicy } from '@/constants/time'
import type { LoginRequest, LoginResponse } from '@/types'
import { bookshopApi } from '../api/bookshopApi'
import {
  authSessionChanged,
  authSessionRestoring,
  authTokenRefreshed,
} from '../slices/user'
import type { AppDispatch, RootState } from '../store'

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let tokenFetch: {
  version: number
  forced: boolean
  promise: Promise<void>
} | null = null
let tokenRequestId: string | undefined
let sessionChannel: BroadcastChannel | undefined

function notifySessionChanged(): void {
  try {
    sessionChannel?.postMessage('session-changed')
  } catch {
    // Session changes still work when cross-tab messaging is unavailable.
  }
}

export function listenForSessionChanges(
  store: { dispatch: AppDispatch; getState: () => RootState },
  hot?: ImportMeta['hot'],
) {
  let channel: BroadcastChannel | undefined

  const synchronize = () => {
    store.dispatch(authSessionRestoring())
    store.dispatch(bookshopApi.util.resetApiState())
    resetTokenRetry()
    void store.dispatch(bootstrapSession({ force: true }))
  }

  try {
    channel = new BroadcastChannel('bookshop-session')
    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (event.data === 'session-changed') {
        synchronize()
      }
    }
    sessionChannel = channel
  } catch {
    // Foreground checks also work without BroadcastChannel support.
  }

  const onForeground = () => {
    if (document.visibilityState === 'visible') {
      void store.dispatch(bootstrapSession({ force: true }))
    }
  }

  window.addEventListener('focus', onForeground)
  window.addEventListener('pageshow', onForeground)
  document.addEventListener('visibilitychange', onForeground)

  const stop = () => {
    channel?.close()

    if (sessionChannel === channel) {
      sessionChannel = undefined
    }

    window.removeEventListener('focus', onForeground)
    window.removeEventListener('pageshow', onForeground)
    document.removeEventListener('visibilitychange', onForeground)
  }

  hot?.dispose(stop)

  return stop
}

const resetTokenRetry = () => {
  tokenFailureCount = 0
  tokenNextAttemptAt = 0
}

/** Compare account identity for cache cleanup only; the server verifies tokens. */
function tokenUserId(token: string | null): string | undefined {
  const payload = token?.split('.')[1]

  if (!payload) {
    return undefined
  }

  try {
    const claims: unknown = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    )

    if (
      claims &&
      typeof claims === 'object' &&
      'uuid' in claims &&
      typeof claims.uuid === 'string'
    ) {
      return claims.uuid
    }
  } catch {
    // An unreadable identity requires cache cleanup on a forced session check.
  }

  return undefined
}

/** Share cookie-session restoration across callers, with bounded retries for guests. */
export const bootstrapSession =
  (options?: { force: boolean }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const { accessToken, sessionVersion } = getState().user

    if (accessToken && !options?.force) {
      resetTokenRetry()

      return
    }

    if (
      tokenFetch?.version === sessionVersion &&
      (!options?.force || tokenFetch.forced)
    ) {
      return tokenFetch.promise
    }

    if (
      !options?.force &&
      (tokenFailureCount >= sessionRetryPolicy.maxAttempts ||
        Date.now() < tokenNextAttemptAt)
    ) {
      return
    }

    // Guest navigation continues even when session restoration is rejected.
    const pending = dispatch(fetchAuthTokens({ checkIdentity: options?.force }))
      .then(() => {
        if (getState().user.sessionVersion !== sessionVersion) {
          return
        }

        if (getState().user.accessToken) {
          resetTokenRetry()
        } else {
          tokenNextAttemptAt =
            Date.now() +
            sessionRetryPolicy.initialDelayMs *
              sessionRetryPolicy.multiplier ** tokenFailureCount
          tokenFailureCount++
        }
      })
      .finally(() => {
        if (tokenFetch?.promise === pending) {
          tokenFetch = null
        }
      })

    tokenFetch = {
      version: sessionVersion,
      forced: Boolean(options?.force),
      promise: pending,
    }

    return pending
  }

export const expireAuthSession =
  (accessToken: string) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    if (getState().user.accessToken !== accessToken) {
      return
    }

    dispatch(authSessionChanged(null))
    dispatch(bookshopApi.util.resetApiState())
  }

export const fetchAuthTokens = createAsyncThunk<
  { accessToken: string | null },
  { checkIdentity?: boolean } | void,
  { state: RootState }
>(
  'user/fetchAuthTokens',
  async (options, { dispatch, getState, requestId }) => {
    const { accessToken: previousToken, sessionVersion } = getState().user
    tokenRequestId = requestId
    const isCurrent = () =>
      tokenRequestId === requestId &&
      getState().user.sessionVersion === sessionVersion &&
      getState().user.accessToken === previousToken

    try {
      const tokens = await retrieveAuthTokens()

      if (!isCurrent()) {
        return { accessToken: null }
      }

      const previousUser = tokenUserId(previousToken)
      const currentUser = tokenUserId(tokens.accessToken)
      const accountChanged =
        previousUser && currentUser
          ? previousUser !== currentUser
          : options?.checkIdentity && previousToken !== tokens.accessToken

      if (
        Boolean(previousToken) !== Boolean(tokens.accessToken) ||
        accountChanged
      ) {
        dispatch(bookshopApi.util.resetApiState())
      }

      dispatch(authTokenRefreshed(tokens.accessToken))

      return tokens
    } catch (error) {
      if (isCurrent() && (!options?.checkIdentity || !previousToken)) {
        dispatch(authTokenRefreshed(null))

        if (previousToken) {
          dispatch(bookshopApi.util.resetApiState())
        }
      }

      throw error
    }
  },
)

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { state: RootState; dispatch: AppDispatch }
>('user/login', async (credentials, { dispatch, getState }) => {
  dispatch(authSessionChanged(getState().user.accessToken))
  const version = getState().user.sessionVersion

  try {
    const response = await postUserLogin(credentials)

    if (getState().user.sessionVersion === version) {
      dispatch(bookshopApi.util.resetApiState())
      dispatch(authSessionChanged(response.accessToken))
    } else {
      void dispatch(bootstrapSession({ force: true }))
    }

    notifySessionChanged()

    return response
  } catch (error) {
    if (getState().user.sessionVersion === version) {
      dispatch(authSessionChanged(null))
      dispatch(bookshopApi.util.resetApiState())
    }

    throw error
  }
})

export const logout = createAsyncThunk<
  { success: boolean },
  void,
  { state: RootState; dispatch: AppDispatch }
>('user/logout', async (_, { dispatch, getState }) => {
  dispatch(authSessionChanged(getState().user.accessToken))
  const version = getState().user.sessionVersion
  const response = await postUserLogout()

  if (getState().user.sessionVersion === version) {
    dispatch(authSessionChanged(null))
    dispatch(bookshopApi.util.resetApiState())
    dispatch(resetCheckout())
  } else {
    void dispatch(bootstrapSession({ force: true }))
  }

  notifySessionChanged()

  return response
})
