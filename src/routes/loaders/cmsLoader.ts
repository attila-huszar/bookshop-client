import {
  store,
  fetchAllAuthors,
  fetchAllBooks,
  fetchAllOrders,
  fetchAllUsers,
} from '@/store'
import { type TabValue } from '@/pages/CMS/components'

export const cmsLoader = (tab: TabValue) => {
  switch (tab) {
    case 'orders':
      void store.dispatch(fetchAllOrders())
      break
    case 'books':
      void store.dispatch(fetchAllBooks())

      if (store.getState().cms.authors.length === 0) {
        void store.dispatch(fetchAllAuthors())
      }
      break
    case 'authors':
      void store.dispatch(fetchAllAuthors())
      break
    case 'users':
      void store.dispatch(fetchAllUsers())
      break
  }
}
