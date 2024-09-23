import axios from 'axios'
import { elasticPath, PATH } from '@/constants'
import { sendEmail, uploadImage } from '@/services'
import { passwordEncrypt } from '@/helpers'
import { handleErrors, ParameterError } from '@/errors'
import { IUser } from '@/interfaces'

export const getUserByEmail = async (email: string): Promise<IUser> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IUser }[] } } } = await axios.post(
      `${elasticPath}/${PATH.users}/_search`,
      {
        query: {
          term: {
            email,
          },
        },
        size: 1,
      },
    )

    return hits.hits[0]?._source
  } catch (error) {
    throw handleErrors(error, 'Unable to get user by email')
  }
}

export const getUserByUUID = async (uuid: string): Promise<IUser> => {
  try {
    const {
      data: { _source },
    }: { data: { _source: IUser } } = await axios.get(
      `${elasticPath}/${PATH.users}/_doc/${uuid}`,
    )

    return _source
  } catch (error) {
    throw handleErrors(error, 'Unable to get user by ID')
  }
}

export const checkUserLoggedIn = async (uuid: string): Promise<boolean> => {
  try {
    const userResponse = await getUserByUUID(uuid)

    return userResponse.uuid === uuid
  } catch {
    return false
  }
}

export const postUserRegister = async (user: IUser): Promise<Toast> => {
  try {
    const userResponse = await getUserByEmail(user.email)

    if (userResponse?.email) {
      throw new ParameterError(`${user.email} is already taken`)
    } else {
      if (user.avatar instanceof File) {
        const imageResponse = await uploadImage(user.avatar, 'avatars')
        user.avatar = imageResponse?.url
      }

      await axios.put(`${elasticPath}/${PATH.users}/_doc/${user.uuid}`, user)

      await sendEmail(user.email, user.firstName, {
        verification: user.verificationCode,
      })

      return `${user.email} registered successfully, please verify your email address`
    }
  } catch (error) {
    throw handleErrors(error, 'Registration failed, please try again later')
  }
}

export const postUserPasswordReset = async (email: string): Promise<Toast> => {
  try {
    const userResponse = await getUserByEmail(email)

    if (userResponse) {
      if (userResponse.verified) {
        const passwordResetCode = crypto.randomUUID()

        await axios.post(
          `${elasticPath}/${PATH.users}/_update/${userResponse.uuid}`,
          {
            doc: {
              passwordResetCode,
              passwordResetCodeExpiresAt: new Date(
                Date.now() + 24 * 60 * 60 * 1000,
              ),
            },
          },
        )

        await sendEmail(userResponse.email, userResponse.firstName, {
          passwordReset: passwordResetCode,
        })

        return 'Please check your inbox for the password reset email'
      } else {
        throw new ParameterError('Please verify your email address first')
      }
    } else {
      return 'Please check your inbox for the password reset email'
    }
  } catch (error) {
    throw handleErrors(
      error,
      'Error initiating password reset, please try again later',
    )
  }
}

export const putUser = async (user: IUser): Promise<IUser> => {
  try {
    await axios.post(`${elasticPath}/${PATH.users}/_update/${user.uuid}`, {
      doc: {
        ...user,
      },
    })

    return await getUserByUUID(user.uuid)
  } catch (error) {
    throw handleErrors(error, 'Error updating user')
  }
}

export const verifyPassword = async (
  uuid: string,
  currentPassword: string,
): Promise<boolean> => {
  try {
    const userResponse = await getUserByUUID(uuid)

    return userResponse.password === passwordEncrypt(currentPassword)
  } catch {
    return false
  }
}

export const verifyEmail = async (verificationCode: string): Promise<Toast> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IUser }[] } } } = await axios.post(
      `${elasticPath}/${PATH.users}/_search`,
      {
        query: {
          term: {
            verificationCode,
          },
        },
        size: 1,
      },
    )

    const userResponse = hits.hits[0]?._source

    if (userResponse) {
      if (userResponse.verified) {
        return 'Email already verified, please log in with your email and password'
      } else if (
        new Date(userResponse.verificationCodeExpiresAt).getTime() > Date.now()
      ) {
        await axios.post(
          `${elasticPath}/${PATH.users}/_update/${userResponse.uuid}`,
          {
            doc: {
              verified: true,
            },
          },
          {
            params: {
              refresh: 'true',
            },
          },
        )

        return 'Verification successful, you can now log in'
      } else {
        throw new ParameterError('Verification code expired')
      }
    } else {
      throw new ParameterError('Verification code invalid')
    }
  } catch (error) {
    throw handleErrors(error, 'Failed to verify email, please try again later')
  }
}

export const passwordReset = async (
  passwordResetCode: string,
): Promise<IUser['uuid']> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IUser }[] } } } = await axios.post(
      `${elasticPath}/${PATH.users}/_search`,
      {
        query: {
          term: {
            passwordResetCode,
          },
        },
        size: 1,
      },
    )

    const userResponse = hits.hits[0]?._source

    if (userResponse) {
      if (
        new Date(userResponse.passwordResetCodeExpiresAt!).getTime() >
        Date.now()
      ) {
        return userResponse.uuid
      } else if (!userResponse.verified) {
        throw new ParameterError('Please verify your email address first')
      } else {
        throw new ParameterError('Password reset code expired')
      }
    } else {
      throw new ParameterError('Password reset code invalid')
    }
  } catch (error) {
    throw handleErrors(
      error,
      'Failed to reset password, please try again later',
    )
  }
}
