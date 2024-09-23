import axios from 'axios'
import { elasticPath, PATH } from '@/constants'
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
    const paginateQuery = {
      from: (currentPage - 1) * itemsPerPage,
      size: itemsPerPage,
    }

    const query = {
      ...paginateQuery,
      ...(criteria && {
        query: {
          bool: {
            must: [
              ...(criteria.genre?.length
                ? [
                    {
                      terms: {
                        'genre.keyword': criteria.genre,
                      },
                    },
                  ]
                : []),
              ...(criteria.priceMin || criteria.priceMax
                ? [
                    {
                      range: {
                        discountPrice: {
                          ...(criteria.priceMin && { gte: criteria.priceMin }),
                          ...(criteria.priceMax && { lte: criteria.priceMax }),
                        },
                      },
                    },
                  ]
                : []),
              ...(criteria.discount === 'discountOnly'
                ? [
                    {
                      range: {
                        discount: { gte: 1 },
                      },
                    },
                  ]
                : []),
              ...(criteria.discount === 'fullPriceOnly'
                ? [
                    {
                      term: {
                        discount: 0,
                      },
                    },
                  ]
                : []),
              ...(criteria.publishYearMin || criteria.publishYearMax
                ? [
                    {
                      range: {
                        publishYear: {
                          ...(criteria.publishYearMin && {
                            gte: criteria.publishYearMin,
                          }),
                          ...(criteria.publishYearMax && {
                            lte: criteria.publishYearMax,
                          }),
                        },
                      },
                    },
                  ]
                : []),
              ...(criteria.rating && criteria.rating > 1
                ? [
                    {
                      range: {
                        rating: {
                          gte: criteria.rating,
                        },
                      },
                    },
                  ]
                : []),
            ],
          },
        },
      }),
    }

    const {
      data,
    }: {
      data: {
        hits: {
          hits: { _source: IBook }[]
          total: { value: number }
        }
      }
    } = await axios.post(`${elasticPath}/${PATH.books}/_search`, query)

    return {
      books: data.hits.hits.map((hit) => hit._source),
      total: data.hits.total.value,
    }
  } catch (error) {
    throw handleErrors(error, 'Unable to get books')
  }
}

export const getBookById = async (id: number): Promise<IBook> => {
  try {
    const {
      data: { _source },
    }: { data: { _source: IBook } } = await axios.get(
      `${elasticPath}/${PATH.books}/_doc/${id}`,
    )

    return _source
  } catch (error) {
    throw handleErrors(error, 'Unable to get book by ID')
  }
}

export const getBooksByProperty = async (
  property: string,
): Promise<IBook[]> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IBook }[] } } } = await axios.post(
      `${elasticPath}/${PATH.books}/_search`,
      {
        query: {
          term: {
            [property]: true,
          },
        },
      },
    )

    return hits.hits.map((hit) => hit._source)
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by property')
  }
}

export const getBooksBySearch = async (
  searchString: string,
): Promise<IBook[]> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IBook }[] } } } = await axios.post(
      `${elasticPath}/${PATH.books}/_search`,
      {
        query: {
          wildcard: {
            title: `*${searchString}*`,
          },
        },
      },
    )

    return hits.hits.map((hit) => hit._source)
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by search')
  }
}

export const getBooksByAuthor = async (id: number): Promise<IBook[]> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IBook }[] } } } = await axios.post(
      `${elasticPath}/${PATH.books}/_search`,
      {
        query: {
          term: {
            author: id,
          },
        },
      },
    )

    return hits.hits.map((hit) => hit._source)
  } catch (error) {
    throw handleErrors(error, 'Unable to get books by author')
  }
}

export const getBookSearchOptions = async (): Promise<
  Pick<IFilter, 'genre' | 'price' | 'publishYear'>
> => {
  try {
    const {
      data: { docs },
    }: {
      data: {
        docs: {
          _source: { genre: string[]; price: number[]; publishYear: number[] }
        }[]
      }
    } = await axios.post(`${elasticPath}/${PATH.searchOptions}/_mget`, {
      ids: [0, 1, 2],
    })

    const [id0, id1, id2] = docs.map((doc) => doc._source)

    return {
      genre: id0.genre || [],
      price: id1.price || [],
      publishYear: id2.publishYear || [],
    }
  } catch (error) {
    throw handleErrors(error, 'Unable to get book search options')
  }
}
