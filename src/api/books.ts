import { baseRequest, PATH } from './'
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

  const booksResponse = await baseRequest.get<Book[]>(`${PATH.books}?${params}`)

  const total = booksResponse.headers.get('x-total-count')
  const books = await booksResponse.json()

  return {
    total: Number(total),
    books,
  }
}

export const getBookById = async (id: number): Promise<Book> => {
  const response = await baseRequest.get<Book>(`${PATH.books}/${id}`)
  return await response.json()
}

export const getBooksByProperty = async (
  property: 'newRelease' | 'topSellers',
): Promise<Book[]> => {
  const response = await baseRequest.get<Book[]>(
    `${PATH.books}?${property}=true`,
  )
  return await response.json()
}

export const getBooksBySearch = async (
  searchString: string,
): Promise<Book[]> => {
  const response = await baseRequest.get<Book[]>(
    `${PATH.books}?title=${searchString}`,
  )
  return await response.json()
}

export const getBooksByAuthor = async (id: number): Promise<Book[]> => {
  const response = await baseRequest.get<Book[]>(`${PATH.books}?authorId=${id}`)
  return await response.json()
}

export const getBookSearchOptions = async (): Promise<
  Pick<FilterProps, 'genre' | 'price' | 'publishYear'>
> => {
  const response = await baseRequest.get<{
    genre: string[]
    price: number[]
    publishYear: number[]
  }>(`${PATH.searchOptions}`)
  return await response.json()
}
