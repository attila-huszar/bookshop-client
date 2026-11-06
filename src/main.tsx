import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './i18n'
import { store } from '@/store/store'
import { listenForCheckoutChanges } from '@/services/checkout'
import { rootErrorHandlers } from '@/helpers/errors'
import App from './App.tsx'

listenForCheckoutChanges(store, import.meta.hot)

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
