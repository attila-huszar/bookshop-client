import { fetchUserOrders, store } from '@/store'

export const ordersLoader = () => {
  void store.dispatch(fetchUserOrders())
}
