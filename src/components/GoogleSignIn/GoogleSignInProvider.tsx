import { useCallback, useEffect, useRef, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import type {
  CredentialResponse,
  GsiButtonConfiguration,
  IdConfiguration,
} from '@react-oauth/google'
import { postGoogleNonce } from '@/api/users'
import { googleClientId } from '@/constants/envConfig'
import {
  type GoogleChallenge,
  GoogleSignInContext,
} from './GoogleSignIn.context'

type GoogleCredentialResponse = CredentialResponse & { state?: string }

type GoogleWindow = Window & {
  google?: {
    accounts: {
      id: {
        initialize: (
          options: Omit<IdConfiguration, 'callback'> & {
            callback: (response: GoogleCredentialResponse) => void
          },
        ) => void
        renderButton: (
          element: HTMLElement,
          options: GsiButtonConfiguration & { locale: string },
        ) => void
      }
    }
  }
}

export function GoogleSignInProvider({ children }: PropsWithChildren) {
  const [scriptStatus, setScriptStatus] = useState<
    'loading' | 'ready' | 'error'
  >('loading')
  const [challenge, setChallenge] = useState<GoogleChallenge>()
  const [nonceFailed, setNonceFailed] = useState(false)
  const controllerRef = useRef<AbortController>(null)
  const initializedChallengeRef = useRef<GoogleChallenge>(undefined)
  const handlersRef = useRef(
    new Map<string, (response: CredentialResponse) => void>(),
  )

  useEffect(() => {
    return () => controllerRef.current?.abort()
  }, [])

  const invalidateChallenge = useCallback(() => {
    controllerRef.current?.abort()
    setChallenge(undefined)
  }, [])

  const renewChallenge = useCallback(() => {
    controllerRef.current?.abort()

    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller

    setChallenge(undefined)
    setNonceFailed(false)

    void postGoogleNonce(signal).then(
      ({ nonce }) => {
        if (!signal.aborted) {
          setChallenge({ nonce, signal })
        }
      },
      () => {
        if (!signal.aborted) {
          setNonceFailed(true)
          controller.abort()
        }
      },
    )
  }, [])

  const ensureChallenge = useCallback(() => {
    if (!controllerRef.current || controllerRef.current.signal.aborted) {
      renewChallenge()
    }
  }, [renewChallenge])

  const mountButton = useCallback(
    (
      container: HTMLElement,
      locale: string,
      onSuccess: (response: CredentialResponse) => void,
    ) => {
      const google = (window as GoogleWindow).google

      if (!google || !challenge || challenge.signal.aborted) {
        return
      }

      // GSI configuration belongs to the page, rather than either auth route.
      if (initializedChallengeRef.current !== challenge) {
        google.accounts.id.initialize({
          client_id: googleClientId,
          nonce: challenge.nonce,
          callback: (response) => {
            if (!challenge.signal.aborted && response.state) {
              handlersRef.current.get(response.state)?.(response)
            }
          },
        })
        initializedChallengeRef.current = challenge
      }

      // Google returns this state so an old popup cannot reach a new button.
      const state = crypto.randomUUID()
      const handlers = handlersRef.current
      handlers.set(state, onSuccess)
      google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        text: 'continue_with',
        locale,
        state,
      })

      return () => {
        handlers.delete(state)
        container.replaceChildren()
      }
    },
    [challenge],
  )

  if (!googleClientId) {
    return children
  }

  return (
    <GoogleOAuthProvider
      clientId={googleClientId}
      onScriptLoadSuccess={() => setScriptStatus('ready')}
      onScriptLoadError={() => setScriptStatus('error')}>
      <GoogleSignInContext
        value={{
          scriptStatus,
          challenge,
          nonceFailed,
          ensureChallenge,
          renewChallenge,
          invalidateChallenge,
          mountButton,
        }}>
        {children}
      </GoogleSignInContext>
    </GoogleOAuthProvider>
  )
}
