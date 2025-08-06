import { fetchAuthTokens, fetchUserProfile, store } from '@/store'
import { UserRole } from '@/types'

type AuthLoaderOptions = {
  adminRequired?: boolean
}

export const authLoader = async (options?: AuthLoaderOptions) => {
  const adminRequired = options?.adminRequired ?? false
  let { accessToken, userData } = store.getState().user

  if (!accessToken) {
    const result = await store.dispatch(fetchAuthTokens())
    if (result.meta.requestStatus === 'rejected') return false
    accessToken = store.getState().user.accessToken
    if (!accessToken) return false
  }

  if (!userData) {
    const result = await store.dispatch(fetchUserProfile())
    if (result.meta.requestStatus === 'rejected') return false
    userData = store.getState().user.userData
  }

  if (adminRequired && userData?.role !== UserRole.Admin) return false

  return true
}
