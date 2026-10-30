import { store } from '@/store/store'
import { fetchAuthTokens } from '@/store/thunks/user'

const GUEST_RETRY_DELAY_MS = 1_000
const GUEST_MAX_ATTEMPTS = 4

let tokenFailureCount = 0
let tokenNextAttemptAt = 0
let tokenFetchPromise: Promise<void> | null = null

const scheduleTokenRetry = () => {
  const delay = GUEST_RETRY_DELAY_MS * 2 ** tokenFailureCount
  tokenFailureCount++
  tokenNextAttemptAt = Date.now() + delay
}

const resetTokenRetry = () => {
  tokenFailureCount = 0
  tokenNextAttemptAt = 0
}

/** Share cookie-session restoration across callers, with bounded retries for guests. */
export const bootstrapSession = async () => {
  if (store.getState().user.accessToken) {
    resetTokenRetry()

    return
  }

  if (tokenFetchPromise) {
    return tokenFetchPromise
  }

  if (
    tokenFailureCount >= GUEST_MAX_ATTEMPTS ||
    Date.now() < tokenNextAttemptAt
  ) {
    return
  }

  // Dispatch resolves even for a rejected thunk, so guest navigation can continue.
  tokenFetchPromise = store
    .dispatch(fetchAuthTokens())
    .then(() => {
      if (store.getState().user.accessToken) {
        resetTokenRetry()
      } else {
        scheduleTokenRetry()
      }
    })
    .finally(() => {
      tokenFetchPromise = null
    })

  return tokenFetchPromise
}
