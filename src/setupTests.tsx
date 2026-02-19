import '@testing-library/jest-dom'
import React from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router'
import { vi } from 'vitest'
import { createAppStore } from './store'

globalThis.React = React

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const store = React.useMemo(() => createAppStore(), [])

  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})

afterEach(() => {
  vi.clearAllMocks()
})

vi.mock(import('react-router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
    useParams: vi.fn(),
  }
})

vi.mock('@/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
  useCart: vi.fn(),
  useClickOutside: vi.fn(),
  useDebounce: vi.fn(),
  useBreakpoints: vi.fn().mockReturnValue({ isMobile: false }),
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
  },
}))

vi.mock('@/services', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}))

Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true,
})
