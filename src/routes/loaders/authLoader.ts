import { fetchAuthTokens, fetchUserProfile, store } from '@/store'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  adminRequired?: boolean
}

export const authLoader = async (options?: AuthLoaderOptions) => {
  const adminRequired = options?.adminRequired ?? false
  let { accessToken, userData } = store.getState().user

  if (!accessToken) {
    await store.dispatch(fetchAuthTokens())
    accessToken = store.getState().user.accessToken
  }

  if (!userData) {
    await store.dispatch(fetchUserProfile())
    userData = store.getState().user.userData
  }

  if (!accessToken) return false
  if (adminRequired && userData?.role !== UserRole.Admin) return false
  return true
}
