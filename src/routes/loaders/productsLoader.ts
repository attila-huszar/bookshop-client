import {
  store,
  fetchBooks,
  fetchBooksByProperty,
  fetchBookSearchOptions,
  fetchNews,
  fetchRecommendedBooks,
} from '@/store'

export const productsLoader = () => {
  const state = store.getState()

  if (state.books.booksInShop.length === 0) {
    void store
      .dispatch(fetchBooks())
      .then(() => void store.dispatch(fetchRecommendedBooks(4)))
    void store.dispatch(fetchBooksByProperty('newRelease'))
    void store.dispatch(fetchBooksByProperty('topSellers'))
    void store.dispatch(fetchBookSearchOptions())
  }

  if (state.news.newsArray.length === 0) {
    void store.dispatch(fetchNews())
  }
}
