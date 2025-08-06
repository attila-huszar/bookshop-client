import { fetchAuthTokens, fetchUserProfile, store } from '@/store'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  adminRequired?: boolean
}

export const authLoader = async (options?: AuthLoaderOptions) => {
  let { accessToken, userData } = store.getState().user
  const adminRequired = options?.adminRequired ?? false

  if (!accessToken) {
    await store.dispatch(fetchAuthTokens())
    accessToken = store.getState().user.accessToken
    if (!accessToken) return false
  }

  if (!userData) {
    await store.dispatch(fetchUserProfile())
    userData = store.getState().user.userData
    if (!userData) return false
  }

  if (adminRequired && userData?.role !== UserRole.Admin) return false

  return true
}
