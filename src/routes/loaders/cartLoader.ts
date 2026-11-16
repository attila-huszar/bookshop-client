import { replace } from 'react-router'
import { ROUTE } from '@/routes/route'
import { getCheckoutPaymentId } from '@/store/thunks/checkout'

export const cartLoader = () => {
  if (getCheckoutPaymentId()) {
    return replace(`/${ROUTE.CHECKOUT}`)
  }
}
