import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import { listenForSessionChanges } from '@/store/thunks/auth'
import { listenForCheckoutChanges } from '@/store/thunks/checkout'
import { rootErrorHandlers } from '@/helpers/errors'
import App from './App.tsx'
import { listenForLanguageChanges } from './i18n'

listenForSessionChanges(store)
listenForCheckoutChanges(store)
listenForLanguageChanges()

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
