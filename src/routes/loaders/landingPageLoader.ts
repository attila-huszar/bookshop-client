import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'
import { cacheTimes } from '@/store/api/cacheTimes'

export const landingPageLoader = () => {
  for (const property of ['newRelease', 'topSellers', 'recommended'] as const) {
    store.dispatch(
      bookshopApi.util.prefetch('booksByProperty', property, {
        ifOlderThan: cacheTimes.featured,
      }),
    )
  }

  store.dispatch(
    bookshopApi.util.prefetch('news', undefined, {
      ifOlderThan: cacheTimes.featured,
    }),
  )
}
