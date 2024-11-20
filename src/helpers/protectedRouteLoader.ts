import { retrieveAuthTokens } from '@/api/users'

export const protectedRouteLoader = async () => {
  const { accessToken } = await retrieveAuthTokens()

  return Boolean(accessToken)
}
