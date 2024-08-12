import axios, { AxiosError } from 'axios'
import { URL } from 'constants/index'
import { sendEmail, cloudinaryUploadPreset } from 'services'
import { passwordEncrypt } from 'helpers'
import { IUser } from 'interfaces'

export const getUserByEmail = async (email: string): Promise<IUser> => {
  try {
    const { data } = await axios.get(`${URL.users}?email=${email}`)

    return data.length && data[0]
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.message
    } else {
      throw 'User not found'
    }
  }
}

export const getUserByUUID = async (
  uuid: string,
  rejectWithValue: (value: unknown) => void,
): Promise<IUser> => {
  try {
    const { data } = await axios.get(`${URL.users}?uuid=${uuid}`)

    return data.length && data[0]
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const checkUserLoggedIn = async (uuid: string): Promise<boolean> => {
  try {
    const { data } = await axios.get(`${URL.users}?uuid=${uuid}`)

    return data.length && data[0].uuid === uuid
  } catch {
    return false
  }
}

export const postUserRegister = async (user: IUser): Promise<string> => {
  try {
    const userResponse = await getUserByEmail(user.email)

    if (!userResponse) {
      if (user.avatar instanceof File) {
        const imageResponse = await uploadImage(user.avatar, 'avatars')
        user.avatar = imageResponse.url
      }

      const emailVerifyResponse = await sendEmail(user.email, user.firstName, {
        verification: user.verificationCode,
      })

      const registerResponse = await axios.post(`${URL.users}`, user)

      if (emailVerifyResponse.status < 300 && registerResponse.status < 300) {
        return `${user.email} registered successfully! Please verify your email address!`
      } else if (emailVerifyResponse.status >= 300) {
        throw emailVerifyResponse.text
      } else if (registerResponse.status >= 300) {
        throw registerResponse.statusText
      } else {
        throw 'Registration Failed'
      }
    } else if (userResponse.email === user.email) {
      throw `${user.email} is already taken!`
    } else {
      throw 'Unknown error occurred'
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.message
    } else {
      throw error
    }
  }
}

export const postUserPasswordReset = async (email: string): Promise<string> => {
  try {
    const userResponse = await getUserByEmail(email)

    if (userResponse && userResponse.verified) {
      const passwordResetCode = crypto.randomUUID()

      axios.patch(`${URL.users}/${userResponse.id}`, {
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
        return 'Check your email for the password reset code!'
      } else {
        throw 'Error sending email, please try again later'
      }
    } else if (!userResponse.verified) {
      throw 'Please verify your email address first'
    } else {
      return 'Check your email for the password reset code!'
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error.message
    } else {
      throw error
    }
  }
}

export const putUser = async (
  user: IUser,
  rejectWithValue: (value: unknown) => void,
): Promise<IUser> => {
  try {
    const response = await axios.put(`${URL.users}/${user.id}`, user)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
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
    return 'Email already verified! Log in with your email and password'
  } else if (
    data.length &&
    data[0].verificationCode === verificationCode &&
    new Date(data[0].verificationCodeExpiresAt).getTime() > Date.now()
  ) {
    const verifyResponse = await axios.put(`${URL.users}/${data[0].id}`, {
      ...data[0],
      verified: true,
    })

    if (verifyResponse.status < 300) {
      return 'Verification successful! You can now log in'
    } else {
      throw verifyResponse.statusText
    }
  } else {
    throw 'Verification code expired or invalid'
  }
}

export const passwordReset = async (
  passwordResetCode: string,
): Promise<{ success: boolean; uuid: string | null; message: string }> => {
  try {
    const { data }: { data: IUser[] } = await axios.get(
      `${URL.users}?passwordResetCode=${passwordResetCode}`,
    )

    if (
      data.length &&
      data[0].passwordResetCode === passwordResetCode &&
      new Date(data[0].passwordResetCodeExpiresAt!).getTime() > Date.now()
    ) {
      return {
        success: true,
        uuid: data[0].uuid,
        message: 'Password reset initiated',
      }
    } else if (data.length && !data[0].verified) {
      throw {
        success: false,
        uuid: null,
        message: 'Please verify your email address first',
      }
    } else {
      throw {
        success: false,
        uuid: null,
        message: 'Password reset code expired or invalid',
      }
    }
  } catch (error) {
    throw {
      success: false,
      message:
        error instanceof AxiosError ? error.message : 'Unknown error occurred',
    }
  }
}

export const uploadImage = async (img: File, folder: 'public' | 'avatars') => {
  const formData = new FormData()
  formData.append('upload_preset', cloudinaryUploadPreset)
  formData.append('folder', `/${cloudinaryUploadPreset}/${folder}`)
  formData.append('file', img)

  try {
    const { data } = await axios.post(URL.cloudinaryUpload, formData)

    return data
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Unknown error occurred'
  }
}
