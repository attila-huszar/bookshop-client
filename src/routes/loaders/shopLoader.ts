import { booksQueryArgs, store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'

export const shopLoader = () => {
  store.dispatch(
    bookshopApi.util.prefetch('books', booksQueryArgs(store.getState()), {
      ifOlderThan: cacheTimes.catalogue,
    }),
  )

  store.dispatch(
    bookshopApi.util.prefetch('searchOptions', undefined, {
      ifOlderThan: cacheTimes.reference,
    }),
  )
}
