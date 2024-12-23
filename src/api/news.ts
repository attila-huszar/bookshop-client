import { baseRequest } from './'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import type { News } from '@/types'

export const getNews = async (): Promise<News[]> => {
  try {
    return baseRequest.get(PATH.SERVER.news).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get news')
  }
}
