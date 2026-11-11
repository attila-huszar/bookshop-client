import { createAsyncThunk } from '@reduxjs/toolkit'
import { postUserLogin, postUserLogout, retrieveAuthTokens } from '@/api/users'
import { resetCheckout } from '@/store/thunks/checkout'
import { sessionRetryPolicy } from '@/constants/time'
import type { LoginRequest, LoginResponse } from '@/types'
import { bookshopApi } from '../api/bookshopApi'
import { authSessionChanged } from '../slices/user'
import type { AppDispatch, RootState } from '../store'

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let tokenFetchPromise: Promise<void> | null = null

const resetTokenRetry = () => {
  tokenFailureCount = 0
  tokenNextAttemptAt = 0
}

/** Share cookie-session restoration across callers, with bounded retries for guests. */
export const bootstrapSession =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (getState().user.accessToken) {
      resetTokenRetry()

      return
    }

    if (tokenFetchPromise) {
      return tokenFetchPromise
    }

    if (
      tokenFailureCount >= sessionRetryPolicy.maxAttempts ||
      Date.now() < tokenNextAttemptAt
    ) {
      return
    }

    // Guest navigation continues even when session restoration is rejected.
    tokenFetchPromise = dispatch(fetchAuthTokens())
      .then(() => {
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
        tokenFetchPromise = null
      })

    return tokenFetchPromise
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
  void,
  { state: RootState }
>('user/fetchAuthTokens', async (_, { dispatch, getState }) => {
  const previousToken = getState().user.accessToken

  try {
    const tokens = await retrieveAuthTokens()

    if (getState().user.accessToken !== previousToken) {
      return tokens
    }

    dispatch(authSessionChanged(tokens.accessToken))

    if (Boolean(previousToken) !== Boolean(tokens.accessToken)) {
      dispatch(bookshopApi.util.resetApiState())
    }

    return tokens
  } catch (error) {
    if (getState().user.accessToken === previousToken) {
      dispatch(authSessionChanged(null))

      if (previousToken) {
        dispatch(bookshopApi.util.resetApiState())
      }
    }

    throw error
  }
})

export const login = createAsyncThunk<LoginResponse, LoginRequest>(
  'user/login',
  async (credentials, { dispatch }) => {
    try {
      const response = await postUserLogin(credentials)
      dispatch(authSessionChanged(response.accessToken))
      dispatch(bookshopApi.util.resetApiState())

      return response
    } catch (error) {
      dispatch(authSessionChanged(null))
      dispatch(bookshopApi.util.resetApiState())

      throw error
    }
  },
)

export const logout = createAsyncThunk<{ success: boolean }, void>(
  'user/logout',
  async (_, { dispatch }) => {
    const response = await postUserLogout()
    dispatch(authSessionChanged(null))
    dispatch(bookshopApi.util.resetApiState())
    dispatch(resetCheckout())

    return response
  },
)
