import { fetchAuthTokens, store, userSelector } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  loginRequired?: boolean
  adminRequired?: boolean
}

const GUEST_BACKOFF_DELAY = 1_000
const GUEST_MAX_RETRIES = 4

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let tokenFetchPromise: Promise<unknown> | null = null

const canSkipTokenBootstrap = () =>
  tokenFailureCount >= GUEST_MAX_RETRIES || Date.now() < tokenNextAttemptAt

const scheduleTokenRetry = () => {
  const delay = GUEST_BACKOFF_DELAY * 2 ** tokenFailureCount
  tokenFailureCount++
  tokenNextAttemptAt = Date.now() + delay
}

const resetTokenRetry = () => {
  tokenFailureCount = 0
  tokenNextAttemptAt = 0
}

export const authLoader = async ({
  loginRequired = false,
  adminRequired = false,
}: AuthLoaderOptions = {}) => {
  const getUserState = () => userSelector(store.getState())
  const { accessToken } = getUserState()
  const requiresLogin = loginRequired || adminRequired

  if (!accessToken) {
    if (!requiresLogin && canSkipTokenBootstrap()) {
      return true
    }

    tokenFetchPromise ??= store.dispatch(fetchAuthTokens()).finally(() => {
      tokenFetchPromise = null
    })
    await tokenFetchPromise

    if (!getUserState().accessToken) {
      if (!requiresLogin) {
        scheduleTokenRetry()
      }

      return !requiresLogin
    }
  }

  resetTokenRetry()

  if (!getUserState().userData) {
    await store.dispatch(
      bookshopApi.endpoints.userProfile.initiate(undefined, {
        subscribe: false,
      }),
    )
  }

  const { userData } = getUserState()

  if (!userData) {
    return !requiresLogin
  }

  return !adminRequired || userData.role === UserRole.Admin
}
