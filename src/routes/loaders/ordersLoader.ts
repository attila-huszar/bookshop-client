import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { authLoader } from './authLoader'

export const ordersLoader = async () => {
  const isAuthenticated = await authLoader({ loginRequired: true })

  if (!isAuthenticated) {
    return
  }

  store.dispatch(
    bookshopApi.util.prefetch('userOrders', undefined, { force: true }),
  )
}
