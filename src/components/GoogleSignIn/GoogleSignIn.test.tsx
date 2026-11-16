import { StrictMode } from 'react'
import { toast } from 'react-hot-toast'
import { i18n } from '@/i18n'
import type {
  GsiButtonConfiguration,
  IdConfiguration,
} from '@react-oauth/google'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { MockInstance } from 'vitest'
import * as usersTransport from '@/api/users'
import { GoogleSignIn } from './GoogleSignIn'

vi.mock('@/constants/envConfig', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/constants/envConfig')>()),
  googleClientId: 'bookshop.apps.googleusercontent.com',
}))

const initialize = vi.fn<(options: IdConfiguration) => void>()
const renderButton =
  vi.fn<(element: HTMLElement, options: GsiButtonConfiguration) => void>()
const onCredential = vi.fn<(credential: string) => Promise<void>>()
let appendScript: MockInstance<typeof document.body.appendChild>

beforeEach(() => {
  vi.stubGlobal('google', {
    accounts: { id: { initialize, renderButton } },
  })
  appendScript = vi.spyOn(document.body, 'appendChild')
  vi.spyOn(usersTransport, 'postGoogleNonce').mockResolvedValue({
    nonce: 'browser-challenge',
  })
  onCredential.mockResolvedValue(undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function providerScript() {
  const script = appendScript.mock.calls
    .map(([node]) => node)
    .reverse()
    .find((node) => node instanceof HTMLScriptElement)

  if (!(script instanceof HTMLScriptElement)) {
    throw new Error('Google script was not requested')
  }

  return script
}

function credentialCallback() {
  const callback = initialize.mock.lastCall?.[0].callback

  if (!callback) {
    throw new Error('Google sign-in was not initialized')
  }

  return callback
}

it('initializes the provider with a fresh browser nonce in StrictMode', async () => {
  vi.mocked(usersTransport.postGoogleNonce).mockResolvedValueOnce({
    nonce: 'first-challenge',
  })
  render(
    <StrictMode>
      <GoogleSignIn disabled={false} onCredential={onCredential} />
    </StrictMode>,
  )
  expect(usersTransport.postGoogleNonce).not.toHaveBeenCalled()
  fireEvent.load(providerScript())
  await waitFor(() => expect(initialize).toHaveBeenCalled())

  expect(initialize).toHaveBeenCalledWith(
    expect.objectContaining({
      client_id: 'bookshop.apps.googleusercontent.com',
      nonce: 'first-challenge',
    }),
  )
  expect(renderButton).toHaveBeenCalledWith(
    expect.any(HTMLElement),
    expect.objectContaining({
      theme: 'outline',
      shape: 'rectangular',
      size: 'large',
      width: undefined,
      locale: 'en',
    }),
  )
  expect(screen.getByRole('separator', { name: 'or' })).toBeInTheDocument()
  expect(usersTransport.postGoogleNonce).toHaveBeenCalledOnce()
  const callback = credentialCallback()
  const firstScript = providerScript()
  await act(async () => {
    callback({ credential: 'opaque-credential-for-server' })
    await Promise.resolve()
  })

  expect(onCredential).toHaveBeenCalledExactlyOnceWith(
    'opaque-credential-for-server',
  )
  await waitFor(() =>
    expect(usersTransport.postGoogleNonce).toHaveBeenCalledTimes(2),
  )
  expect(providerScript()).toBe(firstScript)
  await waitFor(() =>
    expect(initialize).toHaveBeenLastCalledWith(
      expect.objectContaining({ nonce: 'browser-challenge' }),
    ),
  )
  act(() => callback({ credential: 'stale-credential' }))
  expect(onCredential).toHaveBeenCalledOnce()
})

it('ignores callbacks while another login is pending and after unmount', async () => {
  const view = render(<GoogleSignIn disabled onCredential={onCredential} />)
  fireEvent.load(providerScript())
  await waitFor(() => expect(initialize).toHaveBeenCalledOnce())
  const callback = credentialCallback()
  act(() => callback({ credential: 'ignored' }))
  expect(onCredential).not.toHaveBeenCalled()

  view.rerender(<GoogleSignIn disabled={false} onCredential={onCredential} />)
  view.unmount()
  act(() => callback({ credential: 'ignored-after-leaving' }))
  expect(onCredential).not.toHaveBeenCalled()
})

it('reports a script loading failure without remounting the provider', () => {
  render(<GoogleSignIn disabled={false} onCredential={onCredential} />)
  const script = providerScript()
  fireEvent.error(script)

  expect(toast.error).toHaveBeenCalledExactlyOnceWith(
    i18n.t('auth.googleUnavailable'),
  )
  expect(providerScript()).toBe(script)
  expect(usersTransport.postGoogleNonce).not.toHaveBeenCalled()
  expect(initialize).not.toHaveBeenCalled()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Try again' }),
  ).not.toBeInTheDocument()
})

it('requires a successful nonce request before rendering sign-in', async () => {
  vi.mocked(usersTransport.postGoogleNonce).mockRejectedValueOnce(
    new Error('Offline'),
  )
  render(<GoogleSignIn disabled={false} onCredential={onCredential} />)
  fireEvent.load(providerScript())
  await act(async () => {
    await Promise.resolve()
  })

  expect(usersTransport.postGoogleNonce).toHaveBeenCalledOnce()
  expect(initialize).not.toHaveBeenCalled()
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(toast.error).toHaveBeenCalledExactlyOnceWith(
    i18n.t('auth.googleUnavailable'),
  )
})

it('rejects a provider response without a credential', async () => {
  render(<GoogleSignIn disabled={false} onCredential={onCredential} />)
  fireEvent.load(providerScript())
  await waitFor(() => expect(initialize).toHaveBeenCalledOnce())
  act(() => credentialCallback()({}))

  expect(onCredential).not.toHaveBeenCalled()
  expect(usersTransport.postGoogleNonce).toHaveBeenCalledOnce()
})

it('cancels an unfinished nonce request when leaving the page', async () => {
  let resolve!: (value: { nonce: string }) => void
  const response = new Promise<{ nonce: string }>((complete) => {
    resolve = complete
  })
  vi.mocked(usersTransport.postGoogleNonce).mockReturnValueOnce(response)
  const view = render(
    <GoogleSignIn disabled={false} onCredential={onCredential} />,
  )
  fireEvent.load(providerScript())
  await waitFor(() =>
    expect(usersTransport.postGoogleNonce).toHaveBeenCalledOnce(),
  )
  const signal = vi.mocked(usersTransport.postGoogleNonce).mock.lastCall?.[0]
  expect(signal?.aborted).toBe(false)
  view.unmount()
  expect(signal?.aborted).toBe(true)
  await act(async () => {
    resolve({ nonce: 'obsolete-challenge' })
    await response
  })

  expect(initialize).not.toHaveBeenCalled()
  expect(toast.error).not.toHaveBeenCalled()
})

it('does not renew the nonce when a pending login finishes after unmount', async () => {
  let finishLogin!: () => void
  const response = new Promise<void>((resolve) => {
    finishLogin = resolve
  })
  onCredential.mockReturnValueOnce(response)
  const view = render(
    <GoogleSignIn disabled={false} onCredential={onCredential} />,
  )
  fireEvent.load(providerScript())
  await waitFor(() => expect(initialize).toHaveBeenCalledOnce())
  act(() => credentialCallback()({ credential: 'google-credential' }))
  expect(onCredential).toHaveBeenCalledOnce()
  view.unmount()
  await act(async () => {
    finishLogin()
    await response
  })

  expect(usersTransport.postGoogleNonce).toHaveBeenCalledOnce()
  expect(toast.error).not.toHaveBeenCalled()
})

it('ignores script load events after leaving the page', () => {
  const view = render(
    <GoogleSignIn disabled={false} onCredential={onCredential} />,
  )
  const script = providerScript()
  view.unmount()
  fireEvent.load(script)
  fireEvent.error(script)

  expect(usersTransport.postGoogleNonce).not.toHaveBeenCalled()
  expect(onCredential).not.toHaveBeenCalled()
  expect(toast.error).not.toHaveBeenCalled()
})

it('keeps the provider and nonce when the language changes', async () => {
  render(<GoogleSignIn disabled={false} onCredential={onCredential} />)
  fireEvent.load(providerScript())
  await waitFor(() => expect(initialize).toHaveBeenCalledOnce())
  const script = providerScript()
  await act(() => i18n.changeLanguage('hu'))

  expect(providerScript()).toBe(script)
  expect(initialize).toHaveBeenCalledOnce()
  expect(usersTransport.postGoogleNonce).toHaveBeenCalledOnce()
  expect(screen.getByRole('separator', { name: 'vagy' })).toBeInTheDocument()
})
