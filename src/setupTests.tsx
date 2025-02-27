import { vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import { apiChoice } from './constants'
import '@testing-library/jest-dom'

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: vi.fn(),
    useLocation: vi.fn(),
    useParams: vi.fn(),
  }
})

vi.mock(
  import('@/constants'),
  async (importOriginal): Promise<{ apiChoice: typeof apiChoice }> => {
    const actual = await importOriginal()
    return {
      ...actual,
      apiChoice: 'ELASTIC',
    }
  },
)

vi.mock('@/services', () => ({
  cloudinaryConfig: {
    cloudName: 'mockedCloudName',
  },
}))

vi.mock('@/hooks', () => ({
  useAppDispatch: vi.fn(),
  useAppSelector: vi.fn(),
  useLocalStorage: vi.fn(),
  useClickOutside: vi.fn(),
  useDebounce: vi.fn(),
  useCart: vi.fn().mockReturnValue({
    cartArray: [],
    addToCart: vi.fn(),
    removeFromCart: vi.fn(),
    addQuantity: vi.fn(),
    removeQuantity: vi.fn(),
    setQuantity: vi.fn(),
  }),
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <BrowserRouter>{children}</BrowserRouter>
  </Provider>
)

global.scrollTo = vi.fn()

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn()
  HTMLDialogElement.prototype.close = vi.fn()
})
