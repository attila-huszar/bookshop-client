import { bookshopApi } from '@/store/api/bookshopApi'
import { store } from '@/store/store'
import type { TabValue } from '@/pages/CMS/CMS'
import { authLoader } from './authLoader'

export const cmsLoader = async (tab: TabValue) => {
  const isAdmin = await authLoader({ adminRequired: true })

  if (!isAdmin) {
    return
  }

  switch (tab) {
    case 'orders':
      store.dispatch(
        bookshopApi.util.prefetch('cmsOrders', undefined, { force: true }),
      )
      break
    case 'books':
      store.dispatch(bookshopApi.util.prefetch('cmsBooks', undefined))
      store.dispatch(bookshopApi.util.prefetch('cmsAuthors', undefined))
      break
    case 'authors':
      store.dispatch(bookshopApi.util.prefetch('cmsAuthors', undefined))
      break
    case 'users':
      store.dispatch(bookshopApi.util.prefetch('cmsUsers', undefined))
      break
  }
}
