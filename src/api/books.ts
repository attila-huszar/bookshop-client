import { baseRequest } from './api'
import { PATH } from './path'
import { handleErrors } from '@/errors'
import type { Book, FilterProps, FilterActive } from '@/types'

export const getBooks = async ({
  currentPage,
  itemsPerPage,
  criteria,
}: {
  currentPage: number
  itemsPerPage: number
  criteria?: FilterActive
}): Promise<{
  books: Book[]
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

    const booksResponse = await baseRequest.get<Book[]>(
      `${PATH.books}?${params}`,
    )

    const total = booksResponse.headers.get('x-total-count')
    const books = await booksResponse.json()

    return {
      total: Number(total),
      books,
    }
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get books',
    })
    throw formattedError
  }
}

export const getBookById = async (id: number): Promise<Book> => {
  try {
    const response = await baseRequest.get<Book>(`${PATH.books}/${id}`)
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get book by ID',
    })
    throw formattedError
  }
}

export const getBooksByProperty = async (
  property: 'newRelease' | 'topSellers',
): Promise<Book[]> => {
  try {
    const response = await baseRequest.get<Book[]>(
      `${PATH.books}?${property}=true`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get books by property',
    })
    throw formattedError
  }
}

export const getBooksBySearch = async (
  searchString: string,
): Promise<Book[]> => {
  try {
    const response = await baseRequest.get<Book[]>(
      `${PATH.books}?title=${searchString}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get books by search',
    })
    throw formattedError
  }
}

export const getBooksByAuthor = async (id: number): Promise<Book[]> => {
  try {
    const response = await baseRequest.get<Book[]>(
      `${PATH.books}?authorId=${id}`,
    )
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get books by author',
    })
    throw formattedError
  }
}

export const getBookSearchOptions = async (): Promise<
  Pick<FilterProps, 'genre' | 'price' | 'publishYear'>
> => {
  try {
    const response = await baseRequest.get<{
      genre: string[]
      price: number[]
      publishYear: number[]
    }>(`${PATH.searchOptions}`)
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get book search options',
    })
    throw formattedError
  }
}
