import { PATH } from '@/api/path'
import { CacheTime } from '@/constants/time'
import type { News } from '@/types'
import { bookshopApi } from './bookshopApi'

export const newsApi = bookshopApi.injectEndpoints({
  endpoints: (build) => ({
    news: build.query<News[], void>({
      query: () => ({ url: PATH.news }),
      keepUnusedDataFor: CacheTime.FifteenMinutes,
      providesTags: ['News'],
    }),
  }),
})

export const { useNewsQuery } = newsApi
