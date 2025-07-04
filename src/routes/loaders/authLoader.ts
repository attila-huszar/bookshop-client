import { fetchAuthTokens, store } from '@/store'

export const authLoader = async () => {
  const accessToken = store.getState().user.accessToken

  if (!accessToken) {
    await store.dispatch(fetchAuthTokens())
  }
}
