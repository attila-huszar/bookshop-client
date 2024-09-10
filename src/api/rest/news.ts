import axios from 'axios'
import { URL } from '@/constants'
import { handleAxiosError } from '@/helpers'
import { INews } from '@/interfaces'

export const getNews = async (id: string | void): Promise<INews[]> => {
  try {
    const { data }: { data: INews[] } = await axios.get(
      id ? `${URL.news}/${id}` : URL.news,
    )

    return data
  } catch (error) {
    throw handleAxiosError(error, 'Unable to get news')
  }
}
