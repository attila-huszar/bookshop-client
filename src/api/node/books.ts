import axios from 'axios'
import ky from 'ky'
import { jsonServerPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IBook, IFilter, IFilterActive } from '@/interfaces'

export const getBooks = async ({
  currentPage,
  itemsPerPage,
  criteria,
}: {
  currentPage: number
  itemsPerPage: number
  criteria?: IFilterActive
}): Promise<{
  books: IBook[]
  total: number
}> => {
  try {
    const params = new URLSearchParams()

    params.append('page', `${currentPage}`)
    params.append('limit', `${itemsPerPage}`)

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
      params.append('publishYear_gte', `${criteria.publishYearMin}`)
    }

    if (criteria?.publishYearMax) {
      params.append('publishYear_lte', `${criteria.publishYearMax}`)
    }

    if (criteria?.rating && criteria.rating > 1) {
      params.append('rating_gte', `${criteria.rating}`)
    }

    const booksResponse = await axios.get<IBook[]>(
      `${import.meta.env.VITE_NODE_API_URL}/${PATH.books}?${params}`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      },
    )

    console.log(booksResponse.headers)
    //const total = booksResponse.headers['x-total-count']
    const books = booksResponse.data

    return {
      //total: Number(total),
      books,
    }
  } catch (error) {
    throw handleErrors(error, 'Unable to get books')
  }
}

export const getBookById = async (id: number): Promise<IBook> => {
  try {
    const response: { data: IBook } = await axios.get(
      `${import.meta.env.VITE_NODE_API_URL}/${PATH.books}/${id}`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
          'Content-Type': 'application/json',
        },
      },
    )
    return response.data
  } catch (error) {
    throw handleErrors(error, 'Unable to get book by ID')
  }
}

export const getBooksByProperty = async (
  property: string,
): Promise<IBook[]> => {
  try {
    const response: { data: IBook[] } = await axios.get(
      `/json-server/${PATH.books}?${property}=true`,
    )

    return response.data
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by property')
  }
}

export const getBooksBySearch = async (
  searchString: string,
): Promise<IBook[]> => {
  try {
    const response: { data: IBook[] } = await axios.get(
      `${jsonServerPath}/${PATH.books}?title_like=${searchString}`,
    )

    return response.data
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by search')
  }
}

export const getBooksByAuthor = async (id: number): Promise<IBook[]> => {
  try {
    const response: { data: IBook[] } = await axios.get(
      `${jsonServerPath}/${PATH.books}?author=${id}`,
    )

    return response.data
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by author')
  }
}

export const getBookSearchOptions = async (): Promise<
  Pick<IFilter, 'genre' | 'price' | 'publishYear'>
> => {
  try {
    const response: { data: IFilter } = await axios.get(
      `${jsonServerPath}/${PATH.searchOptions}`,
    )

    return response.data
  } catch (error) {
    throw handleErrors(error, 'Unable to get book search options')
  }
}
