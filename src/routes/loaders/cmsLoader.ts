import {
  store,
  fetchAllAuthors,
  fetchAllBooks,
  fetchAllOrders,
  fetchAllUsers,
} from '@/store'

export const cmsLoader = () => {
  const cmsState = store.getState().cms

  if (cmsState.books.length === 0) {
    void store.dispatch(fetchAllBooks())
  }
  if (cmsState.orders.length === 0) {
    void store.dispatch(fetchAllOrders())
  }
  if (cmsState.authors.length === 0) {
    void store.dispatch(fetchAllAuthors())
  }
  if (cmsState.users.length === 0) {
    void store.dispatch(fetchAllUsers())
  }
}
