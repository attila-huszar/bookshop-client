import axios from 'axios'
import { jsonServerPath, PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { INews } from '@/interfaces'

export const getNews = async (): Promise<INews[]> => {
  try {
    const { data }: { data: INews[] } = await axios.get(
      `${jsonServerPath}/${PATH.news}`,
    )

    return data
  } catch (error) {
    throw handleErrors(error, 'Unable to get news')
  }
}
