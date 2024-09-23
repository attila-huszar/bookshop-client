import axios from 'axios'
import { elasticPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { IAuthor } from '@/interfaces'

export const getAuthorById = async (id: number): Promise<IAuthor> => {
  try {
    const {
      data: { _source },
    }: { data: { _source: IAuthor } } = await axios.get(
      `${elasticPath}/${PATH.authors}/_doc/${id}`,
    )

    return _source
  } catch (error) {
    throw handleErrors(error, 'Author not found')
  }
}

export const getAuthorsBySearch = async (
  searchString: string,
): Promise<IAuthor[]> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: IAuthor }[] } } } = await axios.post(
      `${elasticPath}/${PATH.authors}/_search`,
      {
        query: {
          wildcard: {
            name: `*${searchString}*`,
          },
        },
      },
    )

    return hits.hits.map((hit) => hit._source)
  } catch (error) {
    throw handleErrors(error, 'Author not found')
  }
}
