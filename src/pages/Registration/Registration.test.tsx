import { toast } from 'react-hot-toast'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import ky from 'ky'
import { vi } from 'vitest'
import * as publicApi from '@/api/baseRequest'
import * as usersTransport from '@/api/users'
import { bookshopApi } from '@/store/api/bookshopApi'
import { usersApi } from '@/store/api/usersApi'
import { createAppStore } from '@/store/store'
import { AuthorizationMenu } from '@/components/AuthorizationMenu'
import type { LoginResponse } from '@/types'
import { AuthErrorCode, UserErrorCode } from '@/types/ApiError'
import { Registration } from './Registration'

vi.mock('@/constants/envConfig', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/constants/envConfig')>()),
  googleClientId: 'google-client-id',
}))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useNavigate: vi.fn(),
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

function deferredGoogleLogin() {
  let resolve!: (value: LoginResponse) => void
  let reject!: (reason: Error) => void
  const promise = new Promise<LoginResponse>((complete, fail) => {
    resolve = complete
    reject = fail
  })

  return { promise, resolve, reject }
}

function deferredResponse() {
  let resolve!: (value: Response) => void
  const promise = new Promise<Response>((onResolve) => {
    resolve = onResolve
  })

  return { promise, resolve }
}

describe('Registration', () => {
  let store: ReturnType<typeof createAppStore>
  let detectCountry: (value: { country: string }) => void
  let countryResponse: ReturnType<typeof usersTransport.getUserCountry>
  let sendRegistration: ReturnType<typeof vi.fn<typeof fetch>>
  const navigate = vi.fn()
  const countryCodes = {
    hu: 'Hungary',
    us: 'United States',
    gb: 'United Kingdom',
  }

  beforeEach(async () => {
    store = createAppStore()
    await store.dispatch(
      usersApi.util.upsertQueryData('countryCodes', undefined, countryCodes),
    )
    countryResponse = new Promise((resolve) => {
      detectCountry = resolve
    })
    vi.spyOn(usersTransport, 'getUserCountry').mockReturnValue(countryResponse)
    vi.spyOn(usersTransport, 'postGoogleLogin').mockResolvedValue({
      accessToken: 'google-access-token',
      firstName: 'Jane',
    })
    vi.mocked(useNavigate).mockReturnValue(navigate)
    sendRegistration = vi
      .fn<typeof fetch>()
      .mockImplementation(() =>
        Promise.resolve(Response.json({ email: 'jane@example.com' })),
      )
    vi.spyOn(publicApi, 'baseRequest').mockImplementation(
      ky.create({
        prefix: 'https://bookshop.test/api',
        retry: 0,
        fetch: async (request, options) => {
          if (new URL(request.url).pathname.endsWith('/users/country-codes')) {
            return Response.json(countryCodes)
          }

          // Finish the multipart upload before Ky cleans up request streams.
          await request.arrayBuffer()

          return sendRegistration(request, options)
        },
      }),
    )
  })

  afterEach(() => {
    act(() => {
      store.dispatch(bookshopApi.util.resetApiState())
    })
    vi.restoreAllMocks()
    sessionStorage.clear()
  })

  const renderRegistration = () =>
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route element={<AuthorizationMenu />}>
              <Route path="/register" element={<Registration />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>,
    )

  const fillRegistration = async () => {
    await userEvent.type(screen.getByLabelText('First Name'), 'Jane')
    await userEvent.type(screen.getByLabelText('Last Name'), 'Doe')
    await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'NewPass123!')
    await userEvent.type(
      screen.getByLabelText('Confirm Password'),
      'NewPass123!',
    )
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))
  }

  it('locks the form during registration and translates the eventual success in the current language', async () => {
    const response = deferredResponse()
    sendRegistration.mockReturnValueOnce(response.promise)
    renderRegistration()
    await fillRegistration()
    await waitFor(() => {
      expect(sendRegistration).toHaveBeenCalledOnce()
    })

    expect(screen.getByLabelText('First Name')).toBeDisabled()
    expect(screen.getByLabelText('Email')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByLabelText('Confirm Password')).toBeDisabled()
    expect(screen.getByLabelText(/upload/i)).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeDisabled()
    expect(usersTransport.postGoogleLogin).not.toHaveBeenCalled()
    await userEvent.click(screen.getByText('Hungary'))
    expect(screen.queryByText('United States')).not.toBeInTheDocument()
    const englishMessage = i18n.t('auth.registered', {
      email: 'jane@example.com',
    })
    await act(() => i18n.changeLanguage('hu'))
    await act(async () => {
      response.resolve(Response.json({ email: 'jane@example.com' }))
      await response.promise
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledExactlyOnceWith(
        i18n.t('auth.registered', { email: 'jane@example.com' }),
      )
    })
    expect(i18n.t('auth.registered', { email: 'jane@example.com' })).not.toBe(
      englishMessage,
    )
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/', { replace: true })
  })

  it('continues with Google without submitting or validating the registration fields', async () => {
    const response = deferredGoogleLogin()
    vi.mocked(usersTransport.postGoogleLogin).mockReturnValueOnce(
      response.promise,
    )
    renderRegistration()
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )

    expect(usersTransport.postGoogleLogin).toHaveBeenCalledExactlyOnceWith(
      'google-credential',
    )
    expect(sendRegistration).not.toHaveBeenCalled()
    expect(screen.getByLabelText('First Name')).toBeDisabled()
    expect(screen.getByLabelText('Password')).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Register' })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: 'Register' }))
    expect(sendRegistration).not.toHaveBeenCalled()

    await act(() => i18n.changeLanguage('hu'))
    await act(async () => {
      response.resolve({
        accessToken: 'google-access-token',
        firstName: 'Jane',
      })
      await response.promise
    })

    expect(store.getState().auth.accessToken).toBe('google-access-token')
    expect(navigate).toHaveBeenCalledExactlyOnceWith('/', { replace: true })
    expect(toast.success).toHaveBeenCalledExactlyOnceWith(
      i18n.t('auth.welcome', { name: 'Jane' }),
    )
  })

  it('preserves entered fields after Google sign-in is rejected and allows retry', async () => {
    vi.mocked(usersTransport.postGoogleLogin).mockRejectedValueOnce(
      Object.assign(new Error('Google identity rejected'), {
        code: AuthErrorCode.InvalidCredentials,
      }),
    )
    renderRegistration()
    await userEvent.type(screen.getByLabelText('First Name'), 'Reader')
    await userEvent.type(screen.getByLabelText('Email'), 'reader@example.com')
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Continue with Google' }),
      ).toBeEnabled(),
    )

    expect(toast.error).toHaveBeenCalledWith(
      i18n.t('errors.invalidCredentials'),
    )
    expect(screen.getByLabelText('First Name')).toHaveValue('Reader')
    expect(screen.getByLabelText('Email')).toHaveValue('reader@example.com')
    expect(navigate).not.toHaveBeenCalled()
    expect(sendRegistration).not.toHaveBeenCalled()
    await userEvent.click(
      screen.getByRole('button', { name: 'Continue with Google' }),
    )
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith('/', { replace: true }),
    )
    expect(usersTransport.postGoogleLogin).toHaveBeenCalledTimes(2)
  })

  it.each(['success', 'failure'] as const)(
    'ignores Google sign-in %s after leaving Registration',
    async (outcome) => {
      const response = deferredGoogleLogin()
      vi.mocked(usersTransport.postGoogleLogin).mockReturnValueOnce(
        response.promise,
      )
      const view = renderRegistration()
      await userEvent.click(
        screen.getByRole('button', { name: 'Continue with Google' }),
      )
      view.unmount()
      await act(async () => {
        if (outcome === 'success') {
          response.resolve({
            accessToken: 'google-access-token',
            firstName: 'Jane',
          })
        } else {
          response.reject(new Error('Offline'))
        }

        await response.promise.catch(() => undefined)
      })

      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    },
  )

  it('keeps form values and permits retry after registration fails', async () => {
    sendRegistration.mockResolvedValueOnce(
      Response.json(
        { code: UserErrorCode.EmailAlreadyExists },
        { status: 400 },
      ),
    )
    renderRegistration()
    await fillRegistration()
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Register' })).toBeEnabled()
    })

    expect(toast.error).toHaveBeenCalledWith(
      i18n.t('errors.emailAlreadyExists'),
    )
    expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com')
    expect(screen.getByLabelText('Password')).toHaveValue('NewPass123!')
    expect(navigate).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'Register' }))
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith('/', { replace: true })
    })
    expect(sendRegistration).toHaveBeenCalledTimes(2)
  })

  it.each(['success', 'failure'] as const)(
    'ignores registration %s after leaving the page',
    async (outcome) => {
      const response = deferredResponse()
      sendRegistration.mockReturnValueOnce(response.promise)
      const view = renderRegistration()
      await fillRegistration()
      await waitFor(() => {
        expect(sendRegistration).toHaveBeenCalledOnce()
      })
      view.unmount()
      await act(async () => {
        response.resolve(
          outcome === 'success'
            ? Response.json({ email: 'jane@example.com' })
            : Response.json(
                { code: UserErrorCode.EmailAlreadyExists },
                { status: 400 },
              ),
        )
        await response.promise
      })

      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
      expect(navigate).not.toHaveBeenCalled()
    },
  )

  it('keeps entered fields and the selected avatar when country detection finishes', async () => {
    renderRegistration()
    const firstName = screen.getByPlaceholderText('First Name')
    const email = screen.getByPlaceholderText('Email')
    const avatar = screen.getByLabelText(/upload/i)
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })

    await userEvent.type(firstName, 'Jane')
    await userEvent.type(email, 'jane@example.com')
    await userEvent.upload(avatar, file)
    await act(async () => {
      detectCountry({ country: 'us' })
      await countryResponse
    })

    expect(firstName).toHaveValue('Jane')
    expect(email).toHaveValue('jane@example.com')
    expect(avatar).toHaveProperty('files', expect.objectContaining({ 0: file }))
    expect(screen.getByText('United States')).toBeInTheDocument()
  })

  it('preserves an explicit country choice made before detection finishes', async () => {
    renderRegistration()
    await userEvent.click(screen.getByText('Hungary'))
    await userEvent.click(screen.getByText('United States'))
    await act(async () => {
      detectCountry({ country: 'gb' })
      await countryResponse
    })

    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.queryByText('United Kingdom')).not.toBeInTheDocument()
  })
})
