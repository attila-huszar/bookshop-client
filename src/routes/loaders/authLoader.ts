import { fetchAuthTokens, fetchUserProfile, store } from '@/store'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  loginRequired?: boolean
  adminRequired?: boolean
}

const GUEST_BACKOFF_DELAY = 1_000
const DEFAULT_GUEST_MAX_RETRIES = 4

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let tokenFetchPromise: Promise<unknown> | null = null
let profileFetchPromise: Promise<unknown> | null = null

const canSkipTokenBootstrap = (maxRetries: number) =>
  tokenFailureCount >= maxRetries || Date.now() < tokenNextAttemptAt

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
  const getUserState = () => store.getState().user
  const { accessToken, userData } = getUserState()
  const requiresLogin = loginRequired || adminRequired

  if (accessToken && userData) {
    resetTokenRetry()
    return adminRequired ? userData.role === UserRole.Admin : true
  }

  if (!accessToken) {
    if (!requiresLogin && canSkipTokenBootstrap(DEFAULT_GUEST_MAX_RETRIES))
      return true

    try {
      tokenFetchPromise ??= store.dispatch(fetchAuthTokens())
      await tokenFetchPromise
    } finally {
      tokenFetchPromise = null
    }

    if (!getUserState().accessToken) {
      if (!requiresLogin) scheduleTokenRetry()
      return !requiresLogin
    }

    resetTokenRetry()
  }

  const { userData: userDataAfterBootstrap } = getUserState()

  if (!userDataAfterBootstrap) {
    try {
      profileFetchPromise ??= store.dispatch(fetchUserProfile())
      await profileFetchPromise
    } finally {
      profileFetchPromise = null
    }

    const { userData: profile } = getUserState()

    if (!profile) {
      return !requiresLogin
    }

    if (adminRequired && profile.role !== UserRole.Admin) {
      return false
    }

    return true
  }

  return adminRequired ? userDataAfterBootstrap.role === UserRole.Admin : true
}
