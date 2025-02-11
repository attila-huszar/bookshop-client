import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App.tsx'

const container = document.getElementById('root')!
const root = createRoot(container, {
  onUncaughtError: console.error,
  onCaughtError: console.warn,
  onRecoverableError: console.warn,
})

root.render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
