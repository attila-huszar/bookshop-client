import axios, { AxiosError } from 'axios'
import { URL, unsignedUploadPreset } from 'lib'
import { passwordEncrypt, sendEmail } from 'helpers'
import {
  IUser,
  IFilter,
  IBook,
  IAuthor,
  IOrder,
  IOrderUpdate,
  ICreateOrder,
} from 'interfaces'

export const getBooks = async (
  {
    _page,
    _limit,
    criteria,
  }: {
    _page: number
    _limit: number
    criteria?: IFilter
  },
  rejectWithValue: (value: unknown) => void,
): Promise<{
  books: IBook[]
  total: number
}> => {
  try {
    const params = new URLSearchParams()

    params.append('_page', `${_page}`)
    params.append('_limit', `${_limit}`)

    if (criteria?.genre?.length) {
      criteria.genre.forEach((genre) => params.append('genre', genre))
    }

    if (criteria?.price[0]) {
      params.append('discountPrice_gte', `${criteria.price[0]}`)
    }

    if (criteria?.price[1]) {
      params.append('discountPrice_lte', `${criteria.price[1]}`)
    }

    if (criteria?.discount === 'discountOnly') {
      params.append('discount_gte', '1')
    } else if (criteria?.discount === 'fullPriceOnly') {
      params.append('discount', '0')
    }

    if (criteria?.publishYear[0]) {
      params.append('yearOfPublishing_gte', `${criteria.publishYear[0]}`)
    }

    if (criteria?.publishYear[1]) {
      params.append('yearOfPublishing_lte', `${criteria.publishYear[1]}`)
    }

    if (criteria?.rating && criteria.rating > 1) {
      params.append('rating_gte', `${criteria.rating}`)
    }

    const booksResponse = await axios.get(URL.books, {
      params,
    })

    return {
      books: booksResponse.data,
      total: booksResponse.headers['x-total-count'],
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getBookById = async (
  id: number,
  rejectWithValue: (value: unknown) => void,
): Promise<IBook> => {
  try {
    const response = await axios.get(`${URL.books}/${id}`)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getBooksByProperty = async (
  property: string,
  rejectWithValue: (value: unknown) => void,
): Promise<IBook[]> => {
  try {
    const { data } = await axios.get(`${URL.books}?${property}=true`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getBooksBySearch = async (
  searchString: string,
  rejectWithValue: (value: unknown) => void,
): Promise<IBook[]> => {
  try {
    const { data } = await axios.get(`${URL.books}?title_like=${searchString}`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getBooksByAuthor = async (
  id: number,
  rejectWithValue: (value: unknown) => void,
): Promise<IBook[]> => {
  try {
    const { data } = await axios.get(`${URL.books}?author=${id}`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getAuthorById = async (
  id: number,
  rejectWithValue: (value: unknown) => void,
): Promise<IAuthor> => {
  try {
    const { data } = await axios.get(`${URL.authors}/${id}`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getAuthorsBySearch = async (
  searchString: string,
  rejectWithValue: (value: unknown) => void,
): Promise<IAuthor[]> => {
  try {
    const { data } = await axios.get(`${URL.authors}?name_like=${searchString}`)

    return data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getNews = async (
  id: string | void,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(id ? `${URL.news}/${id}` : URL.news)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

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

export const getBookSearchOptions = async (
  rejectWithValue: (value: unknown) => void,
): Promise<Pick<IFilter, 'genre' | 'price' | 'publishYear'>> => {
  try {
    const response = await axios.get(URL.searchOptions)

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
  try {
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
  } catch (error) {
    throw error
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
  formData.append('upload_preset', unsignedUploadPreset)
  formData.append('folder', `/${unsignedUploadPreset}/${folder}`)
  formData.append('file', img)

  try {
    const { data } = await axios.post(URL.cloudinaryUpload, formData)

    return data
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Unknown error occurred'
  }
}

export const postOrder = async (
  orderData: ICreateOrder['orderToServer'],
): Promise<IOrder> => {
  try {
    const { data } = await axios.post(URL.orders, orderData)

    return data
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Error creating order'
  }
}

export const postStripePayment = async (
  paymentData: ICreateOrder['orderToStripe'],
): Promise<{ clientSecret: string }> => {
  try {
    const { data } = await axios.post(URL.stripePaymentIntent, paymentData)

    return data
  } catch (error) {
    throw error instanceof AxiosError
      ? error.message
      : 'Error creating payment intent'
  }
}

export const updateOrder = async ({
  paymentId,
  fields,
}: IOrderUpdate): Promise<IOrder> => {
  try {
    const orderResponse = await axios.get(
      `${URL.orders}?paymentId=${paymentId}`,
    )
    const orderData = orderResponse.data

    const { data } = await axios.put(`${URL.orders}/${orderData[0].id}`, {
      ...orderData[0],
      ...fields,
      orderUpdatedAt: new Date(),
    })

    return data
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Error updating order'
  }
}
