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
let profileFailureCount = 0
let profileNextAttemptAt = 0
let tokenFetchPromise: Promise<unknown> | null = null
let profileFetchPromise: Promise<unknown> | null = null

const canSkipTokenBootstrap = (maxRetries: number) =>
  tokenFailureCount >= maxRetries || Date.now() < tokenNextAttemptAt

const canSkipProfileBootstrap = (maxRetries: number) =>
  profileFailureCount >= maxRetries || Date.now() < profileNextAttemptAt

const scheduleTokenRetry = () => {
  const delay = GUEST_BACKOFF_DELAY * 2 ** tokenFailureCount
  tokenFailureCount++
  tokenNextAttemptAt = Date.now() + delay
}

const scheduleProfileRetry = () => {
  const delay = GUEST_BACKOFF_DELAY * 2 ** profileFailureCount
  profileFailureCount++
  profileNextAttemptAt = Date.now() + delay
}

const resetTokenRetry = () => {
  tokenFailureCount = 0
  tokenNextAttemptAt = 0
}

const resetProfileRetry = () => {
  profileFailureCount = 0
  profileNextAttemptAt = 0
}

const resetRetry = () => {
  resetTokenRetry()
  resetProfileRetry()
}

export const authLoader = async ({
  loginRequired = false,
  adminRequired = false,
}: AuthLoaderOptions = {}) => {
  const getUserState = () => store.getState().user
  const { accessToken, userData } = getUserState()
  const requiresLogin = loginRequired || adminRequired

  // Already fully authenticated
  if (accessToken && userData) {
    resetRetry()
    return adminRequired ? userData.role === UserRole.Admin : true
  }

  // ===== TOKEN =====
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
  }

  resetTokenRetry()

  // ===== PROFILE =====
  const { accessToken: tokenAfterBootstrap, userData: userDataAfterBootstrap } =
    getUserState()
  const hasAccessToken = !!tokenAfterBootstrap

  if (!userDataAfterBootstrap) {
    if (
      !requiresLogin &&
      !hasAccessToken &&
      canSkipProfileBootstrap(DEFAULT_GUEST_MAX_RETRIES)
    )
      return true

    try {
      profileFetchPromise ??= store.dispatch(fetchUserProfile())
      await profileFetchPromise
    } finally {
      profileFetchPromise = null
    }

    const { userData: profile } = getUserState()

    if (!profile) {
      if (!requiresLogin && !hasAccessToken) scheduleProfileRetry()
      return !requiresLogin
    }

    if (adminRequired && profile.role !== UserRole.Admin) {
      resetRetry()
      return false
    }
  }

  resetRetry()
  return true
}
