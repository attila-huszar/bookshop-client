import {
  store,
  fetchBooksByProperty,
  fetchRecommendedBooks,
  fetchNews,
} from '@/store'

export const landingPageLoader = () => {
  void store.dispatch(fetchBooksByProperty('newRelease'))
  void store.dispatch(fetchBooksByProperty('topSellers'))
  void store.dispatch(fetchRecommendedBooks(4))
  void store.dispatch(fetchNews())
}
