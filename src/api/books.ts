import { baseRequest } from './'
import { PATH } from '@/constants'
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
      `${PATH.SERVER.books}?${params}`,
    )

    const total = booksResponse.headers.get('x-total-count')
    const books = await booksResponse.json()

    return {
      total: Number(total),
      books,
    }
  } catch (error) {
    throw handleErrors(error, 'Unable to get books')
  }
}

export const getBookById = (id: number): Promise<Book> => {
  try {
    return baseRequest.get(`${PATH.SERVER.books}/${id}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get book by ID')
  }
}

export const getBooksByProperty = (
  property: 'newRelease' | 'topSellers',
): Promise<Book[]> => {
  try {
    return baseRequest.get(`${PATH.SERVER.books}?${property}=true`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by property')
  }
}

export const getBooksBySearch = (searchString: string): Promise<Book[]> => {
  try {
    return baseRequest.get(`${PATH.SERVER.books}?title=${searchString}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by search')
  }
}

export const getBooksByAuthor = (id: number): Promise<Book[]> => {
  try {
    return baseRequest.get(`${PATH.SERVER.books}?authorId=${id}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by author')
  }
}

export const getBookSearchOptions = (): Promise<
  Pick<FilterProps, 'genre' | 'price' | 'publishYear'>
> => {
  try {
    return baseRequest.get(`${PATH.SERVER.searchOptions}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get book search options')
  }
}
