import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { listenForCheckoutChanges } from '@/store/thunks/checkout'
import { listenForSessionChanges } from '@/store/thunks/user'
import { rootErrorHandlers } from '@/helpers/errors'
import App from './App.tsx'
import { listenForLanguageChanges } from './i18n'

listenForSessionChanges(store, import.meta.hot)
listenForCheckoutChanges(store, import.meta.hot)
listenForLanguageChanges(import.meta.hot)

const container = document.getElementById('root')!

const root = createRoot(container, rootErrorHandlers)

root.render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </Provider>
  </StrictMode>,
)
