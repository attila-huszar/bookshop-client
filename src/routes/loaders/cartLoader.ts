import { replace } from 'react-router'
import { ROUTE } from '@/routes/route'
import { store } from '@/store/store'
import { sessionStorageAdapter } from '@/helpers/browserStorage'
import { paymentIdKey } from '@/constants/keys'
import { appLoader } from './appLoader'

export const cartLoader = async () => {
  await appLoader()

  const state = store.getState()
  const activeSession = state.payment?.payment?.paymentToken

  if (activeSession) {
    return replace(`/${ROUTE.CHECKOUT}`)
  }

  const paymentId = sessionStorageAdapter.get<string>(paymentIdKey)
  if (paymentId) {
    return replace(`/${ROUTE.CHECKOUT}`)
  }
}
