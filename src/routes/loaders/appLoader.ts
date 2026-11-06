import { cartRestored } from '@/store/slices/cart'
import { store } from '@/store/store'
import { bootstrapSession } from '@/services/session'
import { readStoredCart } from '@/helpers/checkout'

export const appLoader = async () => {
  await bootstrapSession()
  store.dispatch(cartRestored(readStoredCart()))
}
