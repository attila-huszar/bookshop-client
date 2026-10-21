import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'
import { booksQueryArgs } from '@/store/selectors'
import { store } from '@/store/store'

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
