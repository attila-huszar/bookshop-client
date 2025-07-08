import {
  store,
  fetchAllAuthors,
  fetchAllBooks,
  fetchAllOrders,
  fetchAllUsers,
} from '@/store'

export const cmsLoader = () => {
  void store.dispatch(fetchAllOrders())
  void store.dispatch(fetchAllBooks())
  void store.dispatch(fetchAllAuthors())
  void store.dispatch(fetchAllUsers())
}
