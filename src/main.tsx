import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App.tsx'
import { log } from './libs'
import { store } from './store'

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
      <App />
    </Provider>
  </StrictMode>,
)
