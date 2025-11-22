import { baseRequest, authRequest, PATH } from './'
import type {
  CountryData,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UserUpdate,
} from '@/types'
import { handleError } from '@/errors'

export const retrieveAuthTokens = async (): Promise<{
  accessToken: string
}> => {
  const response = await baseRequest.post<{
    accessToken: string
  }>(PATH.users.refresh, { credentials: 'include' })
  return await response.json()
}

export const getUserProfile = async (): Promise<User> => {
  const response = await authRequest.get<User>(PATH.users.profile)
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
    const formattedError = await handleError({
      error,
      message: 'Login failed, please try again later',
    })
    throw new Error(formattedError.message)
  }
}

export const postUserRegister = async (
  user: RegisterRequest,
): Promise<RegisterResponse> => {
  try {
    const formData = new FormData()
    formData.append('firstName', user.firstName)
    formData.append('lastName', user.lastName)
    formData.append('email', user.email)
    formData.append('password', user.password)
    formData.append('country', user.country)
    if (user.avatar instanceof File) {
      formData.append('avatar', user.avatar)
    }

    const response = await baseRequest.post<RegisterResponse>(
      PATH.users.register,
      { body: formData },
    )
    return await response.json()
  } catch (error) {
    const formattedError = await handleError({
      error,
      message: 'Registration failed, please try again later',
    })
    throw new Error(formattedError.message)
  }
}

export const postUserLogout = async () => {
  try {
    const response = await authRequest.post<{ success: boolean }>(
      PATH.users.logout,
      {
        credentials: 'include',
      },
    )
    return await response.json()
  } catch (error) {
    const formattedError = await handleError({
      error,
      message: 'Logout failed, please try again later',
    })
    throw new Error(formattedError.message)
  }
}

export const patchUserProfile = async (fields: UserUpdate): Promise<User> => {
  const response = await authRequest.patch<User>(PATH.users.profile, {
    json: fields,
  })
  return await response.json()
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

export const uploadAvatar = async (formData: FormData): Promise<User> => {
  const response = await authRequest.post<User>(PATH.users.avatar, {
    body: formData,
  })
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

    return { country: data.country ?? 'hu' }
  } catch {
    return { country: 'hu' }
  }
}

export const getCountryCodes = async (): Promise<CountryData> => {
  const response = await baseRequest.get<CountryData>(PATH.users.countryCodes)
  return await response.json()
}
