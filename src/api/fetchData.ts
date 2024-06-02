import axios, { AxiosError } from 'axios'
import { URL } from './urlConstants'
import { unsignedUploadPreset } from '../lib'
import { passwordEncrypt } from '../utils'
import { IUser, IFilter } from '../interfaces'

export const getBooks = async (
  id: string | void,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(id ? `${URL.books}/${id}` : URL.books)
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
) => {
  try {
    const response = await axios.get(`${URL.books}?${property}=true`)

    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getBooksBySearch = async (searchString: string) => {
  try {
    const { data } = await axios.get(`${URL.books}?title_like=${searchString}`)
    return data
  } catch (error) {
    throw error instanceof AxiosError ? error.message : 'Unknown error occurred'
  }
}

export const fetchAuthors = async (
  id: string | void,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(id ? `${URL.authors}/${id}` : URL.authors)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue(
        id ? 'Unable to display author' : 'Unknown error occurred',
      )
    }
  }
}

export const fetchNews = async (
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

export const getUserByEmail = async (
  email: string,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(`${URL.users}?email=${email}`)
    return response.data[0]
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const getUserByUUID = async (
  uuid: string,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.get(`${URL.users}?uuid=${uuid}`)
    return response.data[0]
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const checkUserLoggedIn = async (uuid: string) => {
  try {
    const { data } = await axios.get(`${URL.users}?uuid=${uuid}`)
    return data.length ? data[0].uuid === uuid : false
  } catch {
    return false
  }
}

export const postUserRegister = async (
  user: IUser,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const response = await axios.post(`${URL.users}`, user)
    return response.data
  } catch (error) {
    if (error instanceof AxiosError) {
      throw rejectWithValue(error.message)
    } else {
      throw rejectWithValue('Unknown error occurred')
    }
  }
}

export const putUser = async (
  user: IUser,
  rejectWithValue: (value: unknown) => void,
) => {
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

export const getFilteredBooks = async (
  criteria: IFilter,
  rejectWithValue: (value: unknown) => void,
) => {
  try {
    const filterString: string[] = []

    criteria.genre.length &&
      criteria.genre.forEach((genre) => {
        filterString.push(`genre_like=${genre}`)
      })

    criteria.price[0] &&
      filterString.push(`discountPrice_gte=${criteria.price[0]}`)
    criteria.price[1] &&
      filterString.push(`discountPrice_lte=${criteria.price[1]}`)

    if (criteria.discount === 'discountOnly') {
      filterString.push(`discount_gte=1`)
    } else if (criteria.discount === 'fullPriceOnly') {
      filterString.push(`discount=0`)
    }

    criteria.publishYear[0] &&
      filterString.push(`yearOfPublishing_gte=${criteria.publishYear[0]}`)
    criteria.publishYear[1] &&
      filterString.push(`yearOfPublishing_lte=${criteria.publishYear[1]}`)

    criteria.rating > 1 && filterString.push(`rating_gte=${criteria.rating}`)

    const response = await axios.get(`${URL.books}?${filterString.join('&')}`)

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
) => {
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
    const { data } = await axios.get(`${URL.users}?uuid=${uuid}`)
    return data.length && data[0].password === passwordEncrypt(currentPassword)
  } catch {
    return false
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
