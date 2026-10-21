import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './i18n'
import { store } from '@/store/store'
import { log } from '@/services/logger'
import App from './App.tsx'

const container = document.getElementById('root')!
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) =>
    void log.error('Uncaught React error', { error, errorInfo }),
  onRecoverableError: (error, errorInfo) =>
    void log.error('Recoverable React error', { error, errorInfo }),
})

root.render(
  <StrictMode>
    <Provider store={store}>
      <Suspense fallback={null}>
        <App />
      </Suspense>
    </Provider>
  </StrictMode>,
)
