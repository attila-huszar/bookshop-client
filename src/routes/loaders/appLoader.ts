import { restoreCartItems, store } from '@/store'
import { authLoader } from './authLoader'

let bootstrapPromise: Promise<null> | null = null

export const appLoader = () => {
  bootstrapPromise ??= authLoader()
    .then(() => {
      // Bootstrap resets the query cache when switching between guest and authenticated
      // states. Start basket requests afterward so their cache entries survive that reset.
      void store.dispatch(restoreCartItems())

      return null
    })
    .finally(() => {
      bootstrapPromise = null
    })

  return bootstrapPromise
}
