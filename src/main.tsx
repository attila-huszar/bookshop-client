import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { logger } from './helpers'
import App from './App.tsx'

const container = document.getElementById('root')!
const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => logger.error(error, errorInfo),
  onRecoverableError: (error, errorInfo) => logger.error(error, errorInfo),
})

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
