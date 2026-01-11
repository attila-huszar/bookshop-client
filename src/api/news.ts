import type { News } from '@/types'
import { baseRequest, PATH } from './'

export const getNews = async (): Promise<News[]> => {
  const response = await baseRequest.get<News[]>(PATH.news)
  return await response.json()
}
