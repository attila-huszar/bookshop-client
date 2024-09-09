import axios from 'axios'
import { URL } from 'constants/index'
import { handleAxiosError } from 'helpers'
import { IBook, IFilter, IFilterApplied } from 'interfaces'

export const getBooks = async ({
  _page,
  _limit,
  criteria,
}: {
  _page: number
  _limit: number
  criteria?: IFilterApplied
}): Promise<{
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

    const booksResponse: {
      data: IBook[]
      headers: {
        'x-total-count': number
      }
    } = await axios.get(URL.books, {
      params,
    })

    return {
      books: booksResponse.data,
      total: booksResponse.headers['x-total-count'],
    }
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get books')
  }
}

export const getBookById = async (id: number): Promise<IBook> => {
  try {
    const response: { data: IBook } = await axios.get(`${URL.books}/${id}`)
    return response.data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get book by ID')
  }
}

export const getBooksByProperty = async (
  property: string,
): Promise<IBook[]> => {
  try {
    const response: { data: IBook[] } = await axios.get(
      `${URL.books}?${property}=true`,
    )

    return response.data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get books by property')
  }
}

export const getBooksBySearch = async (
  searchString: string,
): Promise<IBook[]> => {
  try {
    const response: { data: IBook[] } = await axios.get(
      `${URL.books}?title_like=${searchString}`,
    )

    return response.data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get books by search')
  }
}

export const getBooksByAuthor = async (id: number): Promise<IBook[]> => {
  try {
    const response: { data: IBook[] } = await axios.get(
      `${URL.books}?author=${id}`,
    )

    return response.data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get books by author')
  }
}

export const getBookSearchOptions = async (): Promise<
  Pick<IFilter, 'genre' | 'price' | 'publishYear'>
> => {
  try {
    const response: { data: IFilter } = await axios.get(URL.searchOptions)

    return response.data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get book search options')
  }
}
