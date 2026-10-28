import { store } from '@/store/store'
import { fetchAuthTokens } from '@/store/thunks/user'

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

/** Restore the cookie session once for concurrent startup/checkout callers. */
export const bootstrapSession = async () => {
  const getAccessToken = () => store.getState().user.accessToken

  if (!getAccessToken()) {
    if (!tokenFetchPromise && canSkipTokenBootstrap()) {
      return
    }

    tokenFetchPromise ??= store
      .dispatch(fetchAuthTokens())
      .then(() => {
        if (!getAccessToken()) {
          scheduleTokenRetry()
        }
      })
      .finally(() => {
        tokenFetchPromise = null
      })
    await tokenFetchPromise

    if (!getAccessToken()) {
      return
    }
  }

  resetTokenRetry()
}
