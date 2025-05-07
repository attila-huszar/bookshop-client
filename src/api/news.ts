import { baseRequest, PATH } from './'
import type { News } from '@/types'

export const getNews = async (): Promise<News[]> => {
  const response = await baseRequest.get<News[]>(PATH.news)
  return await response.json()
}
