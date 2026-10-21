import type { LoaderFunctionArgs } from 'react-router'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { store } from '@/store/store'

export const productLoader = ({
  request,
}: Pick<LoaderFunctionArgs, 'request'>) => {
  const url = new URL(request.url)
  const rawId = url.searchParams.get('id') ?? ''
  const id = Number(rawId)

  if (!/^\d+$/.test(rawId) || !Number.isSafeInteger(id) || id <= 0) {
    return null
  }

  store.dispatch(
    bookshopApi.util.prefetch('book', id, {
      ifOlderThan: cacheTimes.catalogue,
    }),
  )

  return id
}
