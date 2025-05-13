import { retrieveAuthTokens } from '@/api'
import { handleError } from '@/errors'

export const protectedRouteLoader = async () => {
  try {
    const { accessToken } = await retrieveAuthTokens()
    return Boolean(accessToken)
  } catch (error) {
    await handleError({
      error,
      message: 'Error retrieving auth tokens.',
    })
    return false
  }
}
