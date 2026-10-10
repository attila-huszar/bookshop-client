import { baseRequest, PATH } from '.'
import { defaultCountry } from '@/constants'
import { handleError } from '@/errors'
import type { LoginRequest, LoginResponse } from '@/types'

export const retrieveAuthTokens = async (): Promise<{
  accessToken: string | null
}> => {
  const response = await baseRequest.post<{
    accessToken: string | null
  }>(PATH.users.refresh, { credentials: 'include' })
  return await response.json()
}

export const postUserLogin = async ({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await baseRequest.post<LoginResponse>(PATH.users.login, {
      json: { email, password },
      credentials: 'include',
    })
    return await response.json()
  } catch (error) {
    const formattedError = handleError({
      error,
      message: 'Login failed, please try again later',
    })
    throw new Error(formattedError.message, { cause: error })
  }
}

export const postUserLogout = async () => {
  try {
    const response = await baseRequest.post<{ success: boolean }>(
      PATH.users.logout,
      {
        credentials: 'include',
      },
    )
    return await response.json()
  } catch (error) {
    const formattedError = handleError({
      error,
      message: 'Logout failed, please try again later',
    })
    throw new Error(formattedError.message, { cause: error })
  }
}

export const postVerifyEmail = async (
  token: string,
): Promise<{ email: string }> => {
  const response = await baseRequest.post<{ email: string }>(
    PATH.users.verification,
    { json: { token } },
  )
  return await response.json()
}

export const postPasswordReset = async (
  email: string,
): Promise<{ message: string }> => {
  const response = await baseRequest.post<{ message: string }>(
    PATH.users.passwordResetRequest,
    { json: { email } },
  )
  return await response.json()
}

export const postVerifyPasswordReset = async (
  token: string,
): Promise<{ token: string }> => {
  const response = await baseRequest.post<{ token: string }>(
    PATH.users.passwordResetToken,
    { json: { token } },
  )
  return await response.json()
}

export const postPasswordResetSubmit = async (
  token: string,
  password: string,
): Promise<{ message: string }> => {
  const response = await baseRequest.post<{ message: string }>(
    PATH.users.passwordResetSubmit,
    { json: { token, password } },
  )
  return await response.json()
}

export const getUserCountry = async (): Promise<{
  country: string
}> => {
  try {
    const response = await baseRequest.get<{ country: string | undefined }>(
      PATH.users.country,
    )
    const data = await response.json()

    return { country: data.country ?? defaultCountry }
  } catch {
    return { country: defaultCountry }
  }
}
