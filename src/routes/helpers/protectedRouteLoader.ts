import { retrieveAuthTokens } from '@/api'

export const protectedRouteLoader = async () => {
  const { accessToken } = await retrieveAuthTokens()

  return Boolean(accessToken)
}
