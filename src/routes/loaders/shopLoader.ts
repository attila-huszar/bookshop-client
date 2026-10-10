import { booksQueryArgs, store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'

export const shopLoader = () => {
  void store.dispatch(
    bookshopApi.endpoints.books.initiate(booksQueryArgs(store.getState()), {
      subscribe: false,
    }),
  )
  void store.dispatch(
    bookshopApi.endpoints.searchOptions.initiate(undefined, {
      subscribe: false,
    }),
  )
}
