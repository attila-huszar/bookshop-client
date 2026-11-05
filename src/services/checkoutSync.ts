import { cartRestored } from '@/store/slices/cart'
import { checkoutReset } from '@/store/slices/payment'
import type { AppDispatch, RootState } from '@/store/store'
import { readStoredCart } from '@/helpers/checkout'
import { cartKey, paymentIdempotencyKey, paymentIdKey } from '@/constants/keys'
import { getCheckoutPaymentId } from './checkout'

/** Read current shared state, since a queued event can describe an older write. */
export function listenForCheckoutChanges(
  dispatch: AppDispatch,
  getState: () => RootState,
) {
  const synchronize = () => {
    const cartItems = readStoredCart()
    const state = getState()

    if (JSON.stringify(state.cart.cartItems) !== JSON.stringify(cartItems)) {
      dispatch(cartRestored(cartItems))
    }

    if (
      state.payment.payment &&
      state.payment.payment.paymentId !== getCheckoutPaymentId()
    ) {
      // Do not remove the other tab's current ID or rotate its retry key.
      dispatch(checkoutReset())
    }
  }

  const onStorage = (event: StorageEvent) => {
    if (
      event.storageArea === localStorage &&
      (event.key === null ||
        [cartKey, paymentIdKey, paymentIdempotencyKey].includes(event.key))
    ) {
      synchronize()
    }
  }

  window.addEventListener('storage', onStorage)
  window.addEventListener('focus', synchronize)
  window.addEventListener('pageshow', synchronize)
  document.addEventListener('visibilitychange', synchronize)

  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener('focus', synchronize)
    window.removeEventListener('pageshow', synchronize)
    document.removeEventListener('visibilitychange', synchronize)
  }
}
