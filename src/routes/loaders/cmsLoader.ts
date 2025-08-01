import { store, listAuthors, listBooks, listOrders, listUsers } from '@/store'
import { type TabValue } from '@/pages/CMS/components'

export const cmsLoader = (tab: TabValue) => {
  switch (tab) {
    case 'orders':
      void store.dispatch(listOrders())
      break
    case 'books':
      void store.dispatch(listBooks())

      if (store.getState().cms.authors.length === 0) {
        void store.dispatch(listAuthors())
      }
      break
    case 'authors':
      void store.dispatch(listAuthors())
      break
    case 'users':
      void store.dispatch(listUsers())
      break
  }
}
