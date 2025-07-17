import { fetchBooks, fetchBookSearchOptions, store } from '@/store'

export const shopLoader = () => {
  void store.dispatch(fetchBooks())
  void store.dispatch(fetchBookSearchOptions())
}
