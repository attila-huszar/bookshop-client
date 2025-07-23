import { fetchBooks, fetchBookSearchOptions, store } from '@/store'

export const shopLoader = () => {
  void store.dispatch(fetchBooks())

  if (!store.getState().books.booksFilters.active.price.length) {
    void store.dispatch(fetchBookSearchOptions())
  }
}
