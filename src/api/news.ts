import { baseRequest } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import type { News } from '@/types'

export const getNews = async (): Promise<News[]> => {
  try {
    const response = await baseRequest.get<News[]>(PATH.SERVER.news)
    const data = await response.json()
    return data
  } catch (error) {
    const formattedError = await handleErrors({
      error,
      message: 'Unable to get news',
    })
    throw formattedError
  }
}
