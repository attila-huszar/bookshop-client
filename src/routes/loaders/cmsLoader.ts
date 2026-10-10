import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import type { TabValue } from '@/pages/CMS/CMS'

export const cmsLoader = (tab: TabValue) => {
  switch (tab) {
    case 'orders':
      void store.dispatch(
        bookshopApi.endpoints.cmsOrders.initiate(undefined, {
          subscribe: false,
        }),
      )
      break
    case 'books':
      void store.dispatch(
        bookshopApi.endpoints.cmsBooks.initiate(undefined, {
          subscribe: false,
        }),
      )

      void store.dispatch(
        bookshopApi.endpoints.cmsAuthors.initiate(undefined, {
          subscribe: false,
        }),
      )
      break
    case 'authors':
      void store.dispatch(
        bookshopApi.endpoints.cmsAuthors.initiate(undefined, {
          subscribe: false,
        }),
      )
      break
    case 'users':
      void store.dispatch(
        bookshopApi.endpoints.cmsUsers.initiate(undefined, {
          subscribe: false,
        }),
      )
      break
  }
}
