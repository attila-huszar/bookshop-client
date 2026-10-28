import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as privateApi from '@/api/authRequest'
import { bookshopApi } from '@/store/api/bookshopApi'
import { usersApi } from '@/store/api/usersApi'
import { authSessionChanged } from '@/store/slices/user'
import { createAppStore } from '@/store/store'
import { UserRole } from '@/types'
import { ProtectedRoute } from './ProtectedRoute'

describe('ProtectedRoute', () => {
  let view: ReturnType<typeof render> | undefined
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
      usersApi.util.upsertQueryData('userProfile', undefined, profile),
    )
  })

  afterEach(() => {
    view?.unmount()
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
    vi.clearAllMocks()
  })

  const renderRoute = (adminRequired = false) =>
    (view = render(
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
    ))

  it('renders authorized content', () => {
    renderRoute()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('waits for a profile before mounting a private page', async () => {
    store.dispatch(bookshopApi.util.resetApiState())
    let finish!: (response: Response) => void
    const response = new Promise<Response>((resolve) => {
      finish = resolve
    })
    vi.spyOn(privateApi, 'authRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () => response,
      }),
    )

    renderRoute(true)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()

    finish(Response.json(profile))
    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
    expect(privateApi.authRequest).toHaveBeenCalledTimes(1)
  })

  it('keeps private content unmounted on a profile failure and allows retry', async () => {
    store.dispatch(bookshopApi.util.resetApiState())
    let failed = true
    vi.spyOn(privateApi, 'authRequest').mockImplementation(() =>
      ky.get('https://bookshop.test/mock', {
        retry: 0,
        fetch: () =>
          Promise.resolve(
            failed
              ? Response.json({}, { status: 503 })
              : Response.json(profile),
          ),
      }),
    )

    renderRoute()
    const refresh = await screen.findByRole('button', { name: 'Refresh' })
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()

    failed = false
    await userEvent.click(refresh)
    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
    expect(privateApi.authRequest).toHaveBeenCalledTimes(2)
  })

  it('denies admin access to a regular user', async () => {
    await store.dispatch(
      usersApi.util.upsertQueryData('userProfile', undefined, {
        ...profile,
        role: UserRole.User,
      }),
    )
    renderRoute(true)

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('redirects guests without rendering private content', () => {
    store.dispatch(authSessionChanged(null))
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
        usersApi.util.upsertQueryData('userProfile', undefined, {
          ...profile,
          role: UserRole.User,
        }),
      )
    })

    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })
})
