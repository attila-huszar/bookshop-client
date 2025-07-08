import {
  store,
  fetchBooks,
  fetchBooksByProperty,
  fetchBookSearchOptions,
  fetchNews,
  fetchRecommendedBooks,
} from '@/store'

export const productsLoader = () => {
  void store
    .dispatch(fetchBooks())
    .then(() => void store.dispatch(fetchRecommendedBooks(4)))
  void store.dispatch(fetchBooksByProperty('newRelease'))
  void store.dispatch(fetchBooksByProperty('topSellers'))
  void store.dispatch(fetchNews())
  void store.dispatch(fetchBookSearchOptions())
}
