import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'

export const productLoader = (request: Request) => {
  const url = new URL(request.url)
  const id = Number(url.searchParams.get('id'))

  if (!id || isNaN(id)) {
    return
  }

  void store.dispatch(
    bookshopApi.endpoints.book.initiate(id, { subscribe: false }),
  )
}
