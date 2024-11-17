import { api } from './api'
import { PATH } from '@/constants'
import { handleErrors } from '@/errors'
import { INews } from '@/interfaces'

export const getNews = async (): Promise<INews[]> => {
  try {
    return api.get(`${PATH.news}`).json()
  } catch (error) {
    throw handleErrors(error, 'Unable to get news')
  }
}
