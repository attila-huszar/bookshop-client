import { authRequest, baseRequest } from './api'
import { PATH } from './path'
import { handleErrors } from '@/errors'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
  UserUpdate,
} from '@/types'

export const retrieveAuthTokens = async (): Promise<{
  accessToken: string
}> => {
  try {
    const response = await baseRequest.post<{
      accessToken: string
    }>(PATH.users.refresh, { credentials: 'include' })
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to retrieve auth tokens',
    })
    throw formattedError
  }
}

export const getUserProfile = async (): Promise<User> => {
  try {
    const response = await authRequest.get<User>(PATH.users.profile)
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to get user profile',
    })
    throw formattedError
  }
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
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to login',
    })
    throw formattedError
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
    if (user.avatar instanceof File) {
      formData.append('avatar', user.avatar)
    }

    const response = await baseRequest.post<RegisterResponse>(
      PATH.users.register,
      { body: formData },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to register',
    })
    throw formattedError
  }
}

export const postUserLogout = async (): Promise<{ message: string }> => {
  try {
    const response = await authRequest.post<{ message: string }>(
      PATH.users.logout,
      { credentials: 'include' },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to logout',
    })
    throw formattedError
  }
}

export const patchUserProfile = async (fields: UserUpdate): Promise<User> => {
  try {
    const response = await authRequest.patch<User>(PATH.users.profile, {
      json: fields,
    })
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to update user profile',
    })
    throw formattedError
  }
}

export const postVerifyEmail = async (
  token: string,
): Promise<{ email: string }> => {
  try {
    const response = await baseRequest.post<{ email: string }>(
      PATH.users.verification,
      { json: { token } },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to verify email',
    })
    throw formattedError
  }
}

export const postPasswordReset = async (
  email: string,
): Promise<{ email: string }> => {
  try {
    const response = await baseRequest.post<{ email: string }>(
      PATH.users.passwordResetRequest,
      { json: { email } },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to send password reset email',
    })
    throw formattedError
  }
}

export const postVerifyPasswordReset = async (
  token: string,
): Promise<{ email: string }> => {
  try {
    const response = await baseRequest.post<{ email: string }>(
      PATH.users.passwordResetToken,
      { json: { token } },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to verify password reset token',
    })
    throw formattedError
  }
}

export const uploadAvatar = async (
  formData: FormData,
): Promise<{ message: 'Upload success' }> => {
  try {
    const response = await authRequest.post<{ message: 'Upload success' }>(
      PATH.upload,
      { body: formData },
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Failed to upload avatar',
    })
    throw formattedError
  }
}
