import { fetchBooks, fetchBookSearchOptions, store } from '@/store'

export const shopLoader = () => {
  const activeFilters = store.getState().books.booksFilters.active
  void store.dispatch(fetchBooks(activeFilters))

  if (!activeFilters.price.length) {
    void store.dispatch(fetchBookSearchOptions())
  }
}
