import { store } from '@/store'
import { bookshopApi } from '@/store/api/bookshopApi'

export const landingPageLoader = () => {
  for (const property of ['newRelease', 'topSellers', 'recommended'] as const) {
    void store.dispatch(
      bookshopApi.endpoints.booksByProperty.initiate(property, {
        subscribe: false,
      }),
    )
  }

  void store.dispatch(
    bookshopApi.endpoints.news.initiate(undefined, { subscribe: false }),
  )
}
