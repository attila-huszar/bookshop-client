import { authRequest, baseRequest } from './'
import { PATH } from '@/constants'
import { uploadImage } from '@/services'
import { IUser, IUserUpdate } from '@/interfaces'

export const retrieveAuthTokens = async (): Promise<{
  accessToken: string
}> => {
  return baseRequest.post(PATH.SERVER.users.refresh).json()
}

export const getUserProfile = async (): Promise<IUser> => {
  return authRequest.get(PATH.SERVER.users.profile).json()
}

export const postUserLogin = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; firstName: string }> => {
  return baseRequest
    .post<{
      accessToken: string
      firstName: string
    }>(PATH.SERVER.users.login, { json: { email, password } })
    .json()
}

export const postUserRegister = async (
  user: Pick<IUser, 'email' | 'firstName' | 'lastName' | 'avatar'> & {
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
  return authRequest.post(PATH.SERVER.users.logout).json()
}

export const patchUserProfile = async (fields: IUserUpdate): Promise<IUser> => {
  return authRequest.patch(PATH.SERVER.users.profile, { json: fields }).json()
}
