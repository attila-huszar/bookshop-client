import { retrieveAuthTokens } from '@/api'
import { handleErrors } from '@/errors'

export const protectedRouteLoader = async () => {
  try {
    const { accessToken } = await retrieveAuthTokens()
    return Boolean(accessToken)
  } catch (error) {
    await handleErrors({
      error,
      message: 'Error retrieving auth tokens.',
    })
    return false
  }
}
