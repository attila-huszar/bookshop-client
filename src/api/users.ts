import { authRequest, baseRequest } from './'
import { PATH } from '@/constants'
import { uploadImage } from '@/services'
import type { User, UserUpdate } from '@/types'

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

export const postUserLogin = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; firstName: string }> => {
  return baseRequest
    .post(PATH.SERVER.users.login, {
      json: { email, password },
      credentials: 'include',
    })
    .json()
}

export const postUserRegister = async (
  user: Pick<User, 'email' | 'firstName' | 'lastName' | 'avatar'> & {
    password: string
  },
): Promise<{ email: string }> => {
  if (user.avatar instanceof File) {
    const imageResponse = await uploadImage(user.avatar, 'avatars')
    user.avatar = imageResponse?.url
  }

  return baseRequest.post(PATH.SERVER.users.register, { json: user }).json()
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
