import { cartRestored } from '@/store/slices/cart'
import { store } from '@/store/store'
import { bootstrapSession } from '@/store/thunks/auth'
import { readStoredCart } from '@/helpers/cart'

export const appLoader = () => {
  store.dispatch(cartRestored(readStoredCart()))
  void store.dispatch(bootstrapSession())
}
