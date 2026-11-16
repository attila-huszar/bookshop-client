import { type ReactNode, useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'

/** Real application providers with a fresh store and in-memory history per mount. */
export function Providers({ children }: { children: ReactNode }) {
  const [store] = useState(createAppStore)

  useEffect(() => {
    return () => {
      store.dispatch(bookshopApi.util.resetApiState())
    }
  }, [store])

  return (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  )
}
