import type { LoaderFunctionArgs } from 'react-router'
import { bookshopApi } from '@/store/api/bookshopApi'
import { store } from '@/store/store'
import { authLoader } from './authLoader'

export const ordersLoader = async ({
  request,
}: Pick<LoaderFunctionArgs, 'request'>) => {
  request.signal.throwIfAborted()

  const isAuthenticated = await authLoader({ loginRequired: true })
  request.signal.throwIfAborted()

  if (!isAuthenticated) {
    return
  }

  store.dispatch(
    bookshopApi.util.prefetch('userOrders', undefined, { force: true }),
  )
}
