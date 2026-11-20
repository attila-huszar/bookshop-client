import { lazy, StrictMode } from 'react'
import type { ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import * as usersTransport from '@/api/users'
import { PublicRoute } from '@/routes/PublicRoute/PublicRoute'
import { bookshopApi } from '@/store/api/bookshopApi'
import { usersApi } from '@/store/api/usersApi'
import {
  authSessionRefreshed,
  authSessionRestorationStarted,
} from '@/store/slices/auth'
import { createAppStore } from '@/store/store'
import { Login } from '@/pages/Login/Login'
import { Registration } from '@/pages/Registration/Registration'
import type { LoginResponse } from '@/types'
import { AuthorizationMenu } from './AuthorizationMenu'

const googleConfig = vi.hoisted<{ clientId: string | null }>(() => ({
  clientId: 'google-client-id',
}))

vi.mock('@/constants/envConfig', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/constants/envConfig')>()),
  get googleClientId() {
    return googleConfig.clientId
  },
}))

vi.mock('@/components/GoogleSignIn/GoogleSignIn', () => ({
  GoogleSignIn: (props: {
    disabled: boolean
    onCredential: (credential: string) => Promise<void>
  }) => (
    <button
      type="button"
      disabled={props.disabled}
      onClick={() => void props.onCredential('google-credential')}>
      Continue with Google
    </button>
  ),
}))

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((complete, fail) => {
    resolve = complete
    reject = fail
  })

  return { promise, resolve, reject }
}

let store: ReturnType<typeof createAppStore>
const account = { accessToken: 'google-access-token', firstName: 'Jane' }

beforeEach(async () => {
  googleConfig.clientId = 'google-client-id'
  store = createAppStore()
  await store.dispatch(
    usersApi.util.upsertQueryData('countryCodes', undefined, {
      hu: 'Hungary',
      us: 'United States',
    }),
  )
  vi.spyOn(usersTransport, 'getUserCountry').mockResolvedValue({
    country: 'hu',
  })
  vi.spyOn(usersTransport, 'postGoogleLogin').mockResolvedValue(account)
  vi.spyOn(usersTransport, 'postUserLogin').mockResolvedValue(account)
})

afterEach(() => {
  act(() => {
    store.dispatch(bookshopApi.util.resetApiState())
  })
  sessionStorage.clear()
  vi.restoreAllMocks()
})

function renderAuth(registration: ReactNode = <Registration />) {
  return render(
    <StrictMode>
      <Provider store={store}>
        <MemoryRouter initialEntries={['/login']}>
          <Link to="/">Home</Link>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route element={<AuthorizationMenu />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={registration} />
              </Route>
            </Route>
            <Route path="/" element={<p>Home page</p>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    </StrictMode>,
  )
}

it('keeps auth fields editable and blocks submissions while the session loads', async () => {
  store.dispatch(authSessionRestorationStarted())
  renderAuth()

  expect(screen.getByRole('textbox', { name: 'Email' })).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Login' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Continue with Google' }),
  ).toBeDisabled()

  await userEvent.click(screen.getByRole('link', { name: 'Register' }))

  expect(screen.getByLabelText('First Name')).toBeEnabled()
  expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled()

  act(() => {
    store.dispatch(authSessionRefreshed(null))
  })

  expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled()
  expect(
    screen.getByRole('button', { name: 'Continue with Google' }),
  ).toBeEnabled()
})

it.each([
  ['en', 'This account is unavailable.'],
  ['hu', 'Ez a fiók nem érhető el.'],
] as const)(
  'shows the unavailable-account toast in %s',
  async (language, message) => {
    await i18n.changeLanguage(language)
    vi.mocked(usersTransport.postGoogleLogin).mockRejectedValueOnce(
      Object.assign(new Error('Sign-in failed'), {
        code: 'ACCOUNT_UNAVAILABLE',
      }),
    )
    renderAuth()

    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(message))
  },
)

it('omits Google sign-in when it is not configured', () => {
  googleConfig.clientId = null
  renderAuth()

  expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Continue with Google' }),
  ).not.toBeInTheDocument()
})

it('keeps the Google button mounted while switching between the auth forms', async () => {
  renderAuth()
  const googleButton = screen.getByRole('button', {
    name: 'Continue with Google',
  })

  await userEvent.click(screen.getByRole('link', { name: 'Register' }))
  expect(screen.getByLabelText('First Name')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue with Google' })).toBe(
    googleButton,
  )

  await userEvent.click(screen.getByRole('link', { name: 'Login' }))
  expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue with Google' })).toBe(
    googleButton,
  )
})

it('keeps the Google button mounted while a lazy auth form loads', async () => {
  const loaded = deferred<{ default: typeof Registration }>()
  const LazyRegistration = lazy(() => loaded.promise)
  renderAuth(<LazyRegistration />)
  const googleButton = screen.getByRole('button', {
    name: 'Continue with Google',
  })

  await userEvent.click(screen.getByRole('link', { name: 'Register' }))
  expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue with Google' })).toBe(
    googleButton,
  )

  await act(async () => {
    loaded.resolve({ default: Registration })
    await loaded.promise
  })
  expect(screen.getByLabelText('First Name')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Continue with Google' })).toBe(
    googleButton,
  )
})

it('keeps one Google attempt and disables either form across tab switches', async () => {
  const response = deferred<LoginResponse>()
  vi.mocked(usersTransport.postGoogleLogin).mockReturnValueOnce(
    response.promise,
  )
  renderAuth()
  await userEvent.click(
    screen.getByRole('button', { name: 'Continue with Google' }),
  )
  expect(screen.getByRole('textbox', { name: 'Email' })).toBeDisabled()

  await userEvent.click(screen.getByRole('link', { name: 'Register' }))
  expect(screen.getByLabelText('First Name')).toBeDisabled()
  expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Continue with Google' }),
  ).toBeDisabled()
  await userEvent.click(
    screen.getByRole('button', { name: 'Continue with Google' }),
  )

  await act(() => i18n.changeLanguage('hu'))
  await act(async () => {
    response.resolve(account)
    await response.promise
  })

  expect(screen.getByText('Home page')).toBeInTheDocument()
  expect(usersTransport.postGoogleLogin).toHaveBeenCalledExactlyOnceWith(
    'google-credential',
  )
  expect(usersTransport.postUserLogin).not.toHaveBeenCalled()
  expect(store.getState().auth.accessToken).toBe(account.accessToken)
  expect(toast.success).toHaveBeenCalledExactlyOnceWith(
    i18n.t('auth.welcome', { name: account.firstName }),
  )
})

it('keeps the shared lock until a password request from the previous form settles', async () => {
  const response = deferred<LoginResponse>()
  vi.mocked(usersTransport.postUserLogin).mockReturnValueOnce(response.promise)
  renderAuth()
  await userEvent.type(
    screen.getByRole('textbox', { name: 'Email' }),
    'jane@example.com',
  )
  await userEvent.type(screen.getByLabelText('Password'), 'old')
  await userEvent.click(screen.getByRole('button', { name: 'Login' }))
  await waitFor(() =>
    expect(usersTransport.postUserLogin).toHaveBeenCalledOnce(),
  )
  await userEvent.click(screen.getByRole('link', { name: 'Register' }))
  expect(screen.getByLabelText('First Name')).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'Continue with Google' }),
  ).toBeDisabled()

  await act(async () => {
    response.reject(new Error('Offline'))
    await response.promise.catch(() => undefined)
  })

  expect(screen.getByLabelText('First Name')).toBeEnabled()
  expect(
    screen.getByRole('button', { name: 'Continue with Google' }),
  ).toBeEnabled()
  expect(toast.error).not.toHaveBeenCalled()
  await userEvent.click(
    screen.getByRole('button', { name: 'Continue with Google' }),
  )
  expect(await screen.findByText('Home page')).toBeInTheDocument()
})

it.each(['success', 'failure'] as const)(
  'ignores Google %s after leaving the shared auth layout',
  async (outcome) => {
    const response = deferred<LoginResponse>()
    vi.mocked(usersTransport.postGoogleLogin).mockReturnValueOnce(
      response.promise,
    )
    renderAuth()
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await userEvent.click(screen.getByRole('link', { name: 'Home' }))

    await act(async () => {
      if (outcome === 'success') {
        response.resolve(account)
      } else {
        response.reject(new Error('Offline'))
      }

      await response.promise.catch(() => undefined)
    })

    expect(screen.getByText('Home page')).toBeInTheDocument()
    expect(toast.success).not.toHaveBeenCalled()
    expect(toast.error).not.toHaveBeenCalled()
  },
)
