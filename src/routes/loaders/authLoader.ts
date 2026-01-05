import { fetchAuthTokens, fetchUserProfile, store } from '@/store'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  adminRequired?: boolean
}

export const authLoader = async (options?: AuthLoaderOptions) => {
  const { accessToken, userData } = store.getState().user
  const adminRequired = options?.adminRequired ?? false

  if (accessToken && userData) {
    return adminRequired ? userData.role === UserRole.Admin : true
  }

  if (!accessToken) {
    await store.dispatch(fetchAuthTokens())
    const newAccessToken = store.getState().user.accessToken
    if (!newAccessToken) return false
  }

  if (!userData) {
    await store.dispatch(fetchUserProfile())
    const newUserData = store.getState().user.userData
    if (!newUserData) return false

    if (adminRequired && newUserData.role !== UserRole.Admin) return false
  }

  return true
}
