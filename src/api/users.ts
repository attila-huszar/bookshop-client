import { authRequest, baseRequest } from './'
import { PATH } from '@/constants'
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
  return baseRequest
    .post(PATH.SERVER.users.refresh, { credentials: 'include' })
    .json()
}

export const getUserProfile = async (): Promise<User> => {
  return authRequest.get(PATH.SERVER.users.profile).json()
}

export const postUserLogin = async ({
  email,
  password,
}: LoginRequest): Promise<LoginResponse> => {
  return baseRequest
    .post(PATH.SERVER.users.login, {
      json: { email, password },
      credentials: 'include',
    })
    .json()
}

export const postUserRegister = async (
  user: RegisterRequest,
): Promise<RegisterResponse> => {
  const formData = new FormData()
  formData.append('firstName', user.firstName)
  formData.append('lastName', user.lastName)
  formData.append('email', user.email)
  formData.append('password', user.password)
  if (user.avatar instanceof File) {
    formData.append('avatar', user.avatar)
  }

  return baseRequest.post(PATH.SERVER.users.register, { body: formData }).json()
}

export const postUserLogout = async (): Promise<{ message: string }> => {
  return authRequest
    .post(PATH.SERVER.users.logout, { credentials: 'include' })
    .json()
}

export const patchUserProfile = async (fields: UserUpdate): Promise<User> => {
  return authRequest.patch(PATH.SERVER.users.profile, { json: fields }).json()
}

export const postVerifyEmail = async (
  token: string,
): Promise<{ email: string }> => {
  return baseRequest
    .post(PATH.SERVER.users.verification, { json: { token } })
    .json()
}

export const postPasswordReset = async (
  email: string,
): Promise<{ email: string }> => {
  return baseRequest
    .post(PATH.SERVER.users.passwordResetRequest, { json: { email } })
    .json()
}

export const postVerifyPasswordReset = async (
  token: string,
): Promise<{ email: string }> => {
  return baseRequest
    .post(PATH.SERVER.users.passwordResetToken, { json: { token } })
    .json()
}
