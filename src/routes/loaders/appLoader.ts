import { store } from '@/store/store'
import { restoreCartItems } from '@/store/thunks/cart'
import { bootstrapSession } from '@/services/session'

export const appLoader = async () => {
  await bootstrapSession()

  // Session transitions reset the query cache. Start basket hydration afterward;
  // page hooks can then reuse its book requests without blocking the app shell.
  void store.dispatch(restoreCartItems())

  return null
}
