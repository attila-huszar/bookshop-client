import { store, fetchBooksByProperty, fetchNews } from '@/store'

export const landingPageLoader = () => {
  if (!store.getState().books.booksReleases.length) {
    void store.dispatch(fetchBooksByProperty('newRelease'))
  }

  if (!store.getState().books.booksTopSellers.length) {
    void store.dispatch(fetchBooksByProperty('topSellers'))
  }

  if (!store.getState().books.booksRecommended.length) {
    void store.dispatch(fetchBooksByProperty('recommended'))
  }

  if (!store.getState().news.newsItems.length) {
    void store.dispatch(fetchNews())
  }
}
