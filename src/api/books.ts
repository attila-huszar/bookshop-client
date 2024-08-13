import axios, { AxiosError } from 'axios'
import { URL } from 'constants/index'
import { IBook, IFilter, IFilterApplied } from 'interfaces'

export const getBooks = async (
  {
    _page,
    _limit,
    criteria,
  }: {
    _page: number
    _limit: number
    criteria?: IFilterApplied
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

    if (criteria?.priceMin) {
      params.append('discountPrice_gte', `${criteria.priceMin}`)
    }

    if (criteria?.priceMax) {
      params.append('discountPrice_lte', `${criteria.priceMax}`)
    }

    if (criteria?.discount === 'discountOnly') {
      params.append('discount_gte', '1')
    } else if (criteria?.discount === 'fullPriceOnly') {
      params.append('discount', '0')
    }

    if (criteria?.publishYearMin) {
      params.append('yearOfPublishing_gte', `${criteria.publishYearMin}`)
    }

    if (criteria?.publishYearMax) {
      params.append('yearOfPublishing_lte', `${criteria.publishYearMax}`)
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
