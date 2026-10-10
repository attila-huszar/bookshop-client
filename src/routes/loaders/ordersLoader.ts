import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'

export const ordersLoader = () => {
  void store.dispatch(
    bookshopApi.endpoints.userOrders.initiate(undefined, { subscribe: false }),
  )
}
