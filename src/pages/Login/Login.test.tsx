import { StrictMode } from 'react'
import { toast } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { MemoryRouter, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import * as usersTransport from '@/api/users'
import { bookshopApi } from '@/store/api/bookshopApi'
import { createAppStore } from '@/store/store'
import type { LoginResponse } from '@/types'
import { AuthErrorCode } from '@/types/ApiError'
import { Login } from './Login'

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })

  return { promise, resolve, reject }
}

const account = { accessToken: 'access-token', firstName: 'Jane' }
const navigate = vi.fn()
let store: ReturnType<typeof createAppStore>

beforeEach(() => {
  vi.clearAllMocks()
  store = createAppStore()
  vi.mocked(useNavigate).mockReturnValue(navigate)
  vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue(account)
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  sessionStorage.clear()
  vi.restoreAllMocks()
})

function renderLogin() {
  return render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    </StrictMode>,
  )
}

async function submitLogin() {
  await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com')
  // Existing accounts can log in without meeting today's new-password policy.
  await userEvent.type(screen.getByLabelText('Password'), 'old')
  await userEvent.click(screen.getByRole('button', { name: 'Login' }))
}

describe('Login', () => {
  it('locks labeled inputs during login and uses the current language on completion', async () => {
    const response = deferred<LoginResponse>()
    vi.mocked(usersTransport.postUserLogin).mockReturnValue(response.promise)
    renderLogin()
    await submitLogin()

    expect(usersTransport.postUserLogin).toHaveBeenCalledExactlyOnceWith({
      email: 'jane@example.com',
      password: 'old',
    })
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled()
    const englishMessage = i18n.t('auth.welcome', { name: 'Jane' })
    await act(() => i18n.changeLanguage('hu'))
    await act(async () => {
      response.resolve(account)
      await response.promise
    })

    expect(i18n.t('auth.welcome', { name: 'Jane' })).not.toBe(englishMessage)
    expect(toast.success).toHaveBeenCalledExactlyOnceWith(
      i18n.t('auth.welcome', { name: 'Jane' }),
    )
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/', { replace: true })
    expect(store.getState().user.accessToken).toBe('access-token')
  })

  it('keeps entered credentials and permits retry after a rejected login', async () => {
    vi.mocked(usersTransport.postUserLogin).mockRejectedValueOnce({
      code: AuthErrorCode.InvalidCredentials,
    })
    renderLogin()
    await submitLogin()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Login' })).toBeEnabled()
    })
    expect(toast.error).toHaveBeenCalledWith(
      i18n.t('errors.invalidCredentials'),
    )
    expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com')
    expect(screen.getByLabelText('Password')).toHaveValue('old')
    expect(navigate).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Login' }))
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/', { replace: true })
    })
    expect(usersTransport.postUserLogin).toHaveBeenCalledTimes(2)
  })

  it.each(['success', 'failure'] as const)(
    'ignores login %s after leaving the page',
    async (outcome) => {
      const response = deferred<LoginResponse>()
      vi.mocked(usersTransport.postUserLogin).mockReturnValue(response.promise)
      const view = renderLogin()
      await submitLogin()
      expect(usersTransport.postUserLogin).toHaveBeenCalledOnce()
      view.unmount()
      await act(async () => {
        if (outcome === 'success') {
          response.resolve(account)
        } else {
          response.reject(new TypeError('Offline'))
        }

        await response.promise.catch(() => undefined)
      })

      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    },
  )
})
