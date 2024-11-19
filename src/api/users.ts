import { api, authApi } from './'
import { PATH } from '@/constants'
import { uploadImage } from '@/services'
import { handleErrors } from '@/errors'
import { IUser } from '@/interfaces'

export const getUserProfile = async (): Promise<IUser> => {
  return authApi.get(`${PATH.users}/profile`).json()
}

export const postUserLogin = async (
  email: string,
  password: string,
): Promise<{ accessToken: string; firstName: string }> => {
  return api
    .post<{
      accessToken: string
      firstName: string
    }>(`${PATH.users}/${PATH.login}`, { json: { email, password } })
    .json()
}

export const postUserRegister = async (
  user: Pick<IUser, 'email' | 'firstName' | 'lastName' | 'avatar'> & {
    password: string
  },
): Promise<Toast> => {
  try {
    if (user.avatar instanceof File) {
      const imageResponse = await uploadImage(user.avatar, 'avatars')
      user.avatar = imageResponse?.url
    }

    const userResponse = await api
      .post(`${PATH.register}`, { json: user })
      .json<{ email: string }>()

    return `${userResponse.email} registered successfully, please verify your email address`
  } catch (error) {
    console.log(error)
    throw handleErrors(error, 'Registration failed, please try again later')
  }
}
