import { bookshopApi } from '@/store/api/bookshopApi'
import { userSelector } from '@/store/selectors'
import { store } from '@/store/store'
import { fetchAuthTokens } from '@/store/thunks/user'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  loginRequired?: boolean
  adminRequired?: boolean
}

const GUEST_BACKOFF_DELAY = 1_000
const GUEST_MAX_RETRIES = 4

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let tokenFetchPromise: Promise<void> | null = null

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
    if (!tokenFetchPromise && !requiresLogin && canSkipTokenBootstrap()) {
      return true
    }

    tokenFetchPromise ??= store
      .dispatch(fetchAuthTokens())
      .then(() => {
        // Concurrent route loaders share one bootstrap attempt and retry budget.
        if (!getUserState().accessToken) {
          scheduleTokenRetry()
        }
      })
      .finally(() => {
        tokenFetchPromise = null
      })
    await tokenFetchPromise

    if (!getUserState().accessToken) {
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
