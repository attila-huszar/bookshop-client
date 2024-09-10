import axios from 'axios'
import { URL } from '@/constants'
import { sendEmail, uploadImage } from '@/services'
import { handleAxiosError, passwordEncrypt } from '@/helpers'
import { IUser } from '@/interfaces'

export const getUserByEmail = async (email: string): Promise<IUser> => {
  try {
    const response: { data: IUser[] } = await axios.get(
      `${URL.users}?email=${email}`,
    )

    return response.data[0]
  } catch (error) {
    throw handleAxiosError(error, 'Error fetching user by email')
  }
}

export const getUserByUUID = async (uuid: string): Promise<IUser> => {
  try {
    const response: { data: IUser[] } = await axios.get(
      `${URL.users}?uuid=${uuid}`,
    )

    if (!response.data || response.data.length === 0) {
      throw new Error('User not found')
    }

    return response.data[0]
  } catch (error) {
    throw handleAxiosError(error, 'Error fetching user by UUID')
  }
}

export const checkUserLoggedIn = async (uuid: string): Promise<boolean> => {
  try {
    const response: { data: IUser[] } = await axios.get(
      `${URL.users}?uuid=${uuid}`,
    )

    return response.data[0].uuid === uuid
  } catch {
    return false
  }
}

export const postUserRegister = async (user: IUser): Promise<string> => {
  try {
    const userResponse = await getUserByEmail(user.email)

    if (userResponse?.email) {
      throw new Error(`${user.email} is already taken`)
    } else {
      if (user.avatar instanceof File) {
        const imageResponse = await uploadImage(user.avatar, 'avatars')
        user.avatar = imageResponse?.url
      }

      await sendEmail(user.email, user.firstName, {
        verification: user.verificationCode,
      })

      await axios.post(`${URL.users}`, user)

      return `${user.email} registered successfully, please verify your email address`
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'text' in error &&
      typeof error.text === 'string'
    ) {
      throw new Error(error.text)
    } else {
      throw new Error('Registration failed, please try again later')
    }
  }
}

export const postUserPasswordReset = async (email: string): Promise<string> => {
  try {
    const userResponse = await getUserByEmail(email)

    if (userResponse?.verified) {
      const passwordResetCode = crypto.randomUUID()

      void axios.patch(`${URL.users}/${userResponse.id}`, {
        passwordResetCode,
        passwordResetCodeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })

      const sendEmailResponse = await sendEmail(
        userResponse.email,
        userResponse.firstName,
        {
          passwordReset: passwordResetCode,
        },
      )

      if (sendEmailResponse.status < 300) {
        return 'Please check your inbox for the password reset email'
      } else {
        throw new Error('Error sending email, please try again later')
      }
    } else {
      return 'Please check your inbox for the password reset email'
    }
  } catch (error) {
    throw handleAxiosError(error, 'Error initiating password reset')
  }
}

export const putUser = async (user: IUser): Promise<IUser> => {
  try {
    const response: { data: IUser } = await axios.put(
      `${URL.users}/${user.id}`,
      user,
    )

    return response.data
  } catch (error) {
    throw handleAxiosError(error, 'Error updating user')
  }
}

export const verifyPassword = async (
  uuid: string,
  currentPassword: string,
): Promise<boolean> => {
  try {
    const { data }: { data: IUser[] } = await axios.get(
      `${URL.users}?uuid=${uuid}`,
    )

    return data.length
      ? data[0].password === passwordEncrypt(currentPassword)
      : false
  } catch {
    return false
  }
}

export const verifyEmail = async (
  verificationCode: string,
): Promise<string> => {
  const { data }: { data: IUser[] } = await axios.get(
    `${URL.users}?verificationCode=${verificationCode}`,
  )

  if (data.length && data[0].verified) {
    return 'Email already verified, please log in with your email and password'
  } else if (
    data.length &&
    data[0].verificationCode === verificationCode &&
    new Date(data[0].verificationCodeExpiresAt).getTime() > Date.now()
  ) {
    const verifyResponse = await axios.put(`${URL.users}/${data[0].id}`, {
      ...data[0],
      verified: true,
    })

    if (verifyResponse.status === 200) {
      return 'Verification successful, you can now log in'
    } else {
      throw new Error(verifyResponse.statusText)
    }
  } else {
    throw new Error('Verification code expired or invalid')
  }
}

export const passwordReset = async (
  resetCode: string,
): Promise<{ uuid: string | null }> => {
  try {
    const { data }: { data: IUser[] } = await axios.get(
      `${URL.users}?passwordResetCode=${resetCode}`,
    )

    if (
      data.length &&
      data[0].passwordResetCode === resetCode &&
      new Date(data[0].passwordResetCodeExpiresAt!).getTime() > Date.now()
    ) {
      return {
        uuid: data[0].uuid,
      }
    } else if (data.length && !data[0].verified) {
      throw new Error('Please verify your email address first')
    } else {
      throw new Error('Password reset code expired or invalid')
    }
  } catch (error) {
    throw handleAxiosError(error, 'Error resetting password')
  }
}
