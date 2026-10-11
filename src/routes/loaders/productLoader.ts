import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'

export const productLoader = ({ request }: { request: Request }) => {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))

  if (!id || isNaN(id)) {
    return
  }

  store.dispatch(
    bookshopApi.util.prefetch('book', id, {
      ifOlderThan: cacheTimes.catalogue,
    }),
  )
}
