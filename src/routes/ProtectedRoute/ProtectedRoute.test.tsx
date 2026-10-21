import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLoaderData } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { authSessionChanged } from '@/store/slices/user'
import { createAppStore } from '@/store/store'
import { UserRole } from '@/types'
import { ProtectedRoute } from './ProtectedRoute'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useLoaderData: vi.fn(),
}))

describe('ProtectedRoute', () => {
  let store: ReturnType<typeof createAppStore>
  const profile = {
    uuid: 'user-uuid',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    country: 'hu',
    phone: null,
    address: null,
    avatar: null,
    role: UserRole.Admin,
  }

  beforeEach(async () => {
    store = createAppStore()
    store.dispatch(authSessionChanged('access-token'))
    await store.dispatch(
      bookshopApi.util.upsertQueryData('userProfile', undefined, profile),
    )
    vi.mocked(useLoaderData).mockReturnValue(true)
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
    vi.clearAllMocks()
  })

  const renderRoute = (adminRequired = false) =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/protected']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={<ProtectedRoute adminRequired={adminRequired} />}>
              <Route index element={<div>Protected Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

  it('renders authorized content', () => {
    renderRoute()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('honors a rejected loader authorization', () => {
    vi.mocked(useLoaderData).mockReturnValue(false)
    renderRoute()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('redirects immediately when an already-authorized session expires', () => {
    renderRoute()
    act(() => {
      store.dispatch(authSessionChanged(null))
    })

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('removes admin content when the current account loses its admin role', async () => {
    renderRoute(true)
    await act(async () => {
      await store.dispatch(
        bookshopApi.util.upsertQueryData('userProfile', undefined, {
          ...profile,
          role: UserRole.User,
        }),
      )
    })

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
