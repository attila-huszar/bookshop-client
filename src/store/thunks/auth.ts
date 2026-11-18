import { createAsyncThunk } from '@reduxjs/toolkit'
import {
  postGoogleLogin,
  postUserLogin,
  postUserLogout,
  retrieveAuthTokens,
} from '@/api/users'
import { resetCheckout } from '@/store/thunks/checkout'
import { sessionRetryPolicy } from '@/constants/time'
import type { LoginRequest, LoginResponse } from '@/types'
import { bookshopApi } from '../api/bookshopApi'
import {
  authSessionChangeCompleted,
  authSessionChangeStarted,
  authSessionRefreshed,
  authSessionRestorationStarted,
} from '../slices/auth'
import type { AppDispatch, RootState } from '../store'

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let pendingBootstrap: {
  version: number
  forced: boolean
  promise: Promise<void>
} | null = null
let latestRefreshRequestId: string | undefined
let sessionChannel: BroadcastChannel | undefined

function notifySessionChanged(): void {
  try {
    sessionChannel?.postMessage('session-changed')
  } catch {
    // Session changes still work when cross-tab messaging is unavailable.
  }
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

function shouldClearSessionCache(
  previousToken: string | null,
  nextToken: string | null,
  clearOnUnknownIdentity = false,
): boolean {
  if (Boolean(previousToken) !== Boolean(nextToken)) {
    return true
  }

  const previousUser = tokenUserId(previousToken)
  const nextUser = tokenUserId(nextToken)

  if (previousUser && nextUser) {
    return previousUser !== nextUser
  }

  return clearOnUnknownIdentity && previousToken !== nextToken
}

/** Share cookie-session restoration across callers, with bounded retries for guests. */
export const bootstrapSession =
  (options?: { force: boolean }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const force = options?.force ?? false
    const { accessToken, isRestoring, sessionVersion } = getState().auth

    if (accessToken && !force) {
      resetTokenRetry()

      return
    }

    if (
      pendingBootstrap?.version === sessionVersion &&
      (!force || pendingBootstrap.forced)
    ) {
      return pendingBootstrap.promise
    }

    if (
      !force &&
      (tokenFailureCount >= sessionRetryPolicy.maxAttempts ||
        Date.now() < tokenNextAttemptAt)
    ) {
      return
    }

    if (!accessToken && !isRestoring) {
      dispatch(authSessionRestorationStarted())
    }

    const restoreVersion = getState().auth.sessionVersion

    // Guest navigation continues even when session restoration is rejected.
    const pending = dispatch(
      fetchAuthTokens(force ? 'session-check' : 'refresh'),
    )
      .then(() => {
        if (getState().auth.sessionVersion !== restoreVersion) {
          return
        }

        if (getState().auth.accessToken) {
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
        if (pendingBootstrap?.promise === pending) {
          pendingBootstrap = null
        }
      })

    pendingBootstrap = {
      version: restoreVersion,
      forced: force,
      promise: pending,
    }

    return pending
  }

export const expireAuthSession =
  (accessToken: string) =>
  (dispatch: AppDispatch, getState: () => RootState): void => {
    if (getState().auth.accessToken !== accessToken) {
      return
    }

    dispatch(authSessionChangeCompleted(null))
    dispatch(bookshopApi.util.resetApiState())
  }

export const fetchAuthTokens = createAsyncThunk<
  { accessToken: string | null },
  'refresh' | 'session-check' | void,
  { state: RootState }
>(
  'auth/fetchAuthTokens',
  async (mode = 'refresh', { dispatch, getState, requestId }) => {
    const { accessToken: previousToken, sessionVersion } = getState().auth
    latestRefreshRequestId = requestId
    const isCurrent = () =>
      latestRefreshRequestId === requestId &&
      getState().auth.sessionVersion === sessionVersion &&
      getState().auth.accessToken === previousToken

    try {
      const tokens = await retrieveAuthTokens()

      if (!isCurrent()) {
        return { accessToken: null }
      }

      if (
        shouldClearSessionCache(
          previousToken,
          tokens.accessToken,
          mode === 'session-check',
        )
      ) {
        dispatch(bookshopApi.util.resetApiState())
      }

      dispatch(authSessionRefreshed(tokens.accessToken))

      return tokens
    } catch (error) {
      const preserveSession = mode === 'session-check' && Boolean(previousToken)

      if (isCurrent() && !preserveSession) {
        dispatch(authSessionRefreshed(null))

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
>('auth/login', (credentials, { dispatch, getState }) =>
  completeLogin(() => postUserLogin(credentials), dispatch, getState),
)

export const googleLogin = createAsyncThunk<
  LoginResponse,
  string,
  { state: RootState; dispatch: AppDispatch }
>('auth/googleLogin', (credential, { dispatch, getState }) =>
  completeLogin(() => postGoogleLogin(credential), dispatch, getState),
)

async function completeLogin(
  send: () => Promise<LoginResponse>,
  dispatch: AppDispatch,
  getState: () => RootState,
): Promise<LoginResponse> {
  dispatch(authSessionChangeStarted())
  const version = getState().auth.sessionVersion

  try {
    const response = await send()

    if (getState().auth.sessionVersion === version) {
      dispatch(bookshopApi.util.resetApiState())
      dispatch(authSessionChangeCompleted(response.accessToken))
    } else {
      void dispatch(bootstrapSession({ force: true }))
    }

    notifySessionChanged()

    return response
  } catch (error) {
    if (getState().auth.sessionVersion === version) {
      dispatch(authSessionChangeCompleted(null))
      dispatch(bookshopApi.util.resetApiState())
    }

    throw error
  }
}

export const logout = createAsyncThunk<
  { success: boolean },
  void,
  { state: RootState; dispatch: AppDispatch }
>('auth/logout', async (_, { dispatch, getState }) => {
  dispatch(authSessionChangeStarted())
  const version = getState().auth.sessionVersion
  const response = await postUserLogout()

  if (getState().auth.sessionVersion === version) {
    dispatch(authSessionChangeCompleted(null))
    dispatch(bookshopApi.util.resetApiState())
    dispatch(resetCheckout())
  } else {
    void dispatch(bootstrapSession({ force: true }))
  }

  notifySessionChanged()

  return response
})

export function listenForSessionChanges(store: {
  dispatch: AppDispatch
  getState: () => RootState
}) {
  let channel: BroadcastChannel | undefined

  const synchronize = () => {
    store.dispatch(authSessionRestorationStarted())
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

  return () => {
    channel?.close()

    if (sessionChannel === channel) {
      sessionChannel = undefined
    }

    window.removeEventListener('focus', onForeground)
    window.removeEventListener('pageshow', onForeground)
    document.removeEventListener('visibilitychange', onForeground)
  }
}
