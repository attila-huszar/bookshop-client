import axios from 'axios'
import { elasticPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { INews } from '@/interfaces'

export const getNews = async (): Promise<INews[]> => {
  try {
    const {
      data: { hits },
    }: { data: { hits: { hits: { _source: INews }[] } } } = await axios.get(
      `${elasticPath}/${PATH.news}/_search`,
    )

    return hits.hits.map((hit) => hit._source)
  } catch (error) {
    throw handleErrors(error, 'Unable to get news')
  }
}
