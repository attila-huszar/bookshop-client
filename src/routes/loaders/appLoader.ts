import { cartRestored } from '@/store/slices/cart'
import { store } from '@/store/store'
import { bootstrapSession } from '@/store/thunks/auth'
import { readStoredCart } from '@/helpers/cart'

export const appLoader = async () => {
  await store.dispatch(bootstrapSession())
  store.dispatch(cartRestored(readStoredCart()))
}
