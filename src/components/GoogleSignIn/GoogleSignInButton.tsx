import { useEffect, useRef } from 'react'
import { useGoogleOAuth } from '@react-oauth/google'
import type {
  CredentialResponse,
  GsiButtonConfiguration,
  IdConfiguration,
} from '@react-oauth/google'

type GoogleSignInButtonProps = {
  nonce: string
  signal: AbortSignal
  locale: string
  onSuccess: (response: CredentialResponse) => void
}

type GoogleWindow = Window & {
  google?: {
    accounts: {
      id: {
        initialize: (options: IdConfiguration) => void
        renderButton: (
          element: HTMLElement,
          options: GsiButtonConfiguration & { locale: string },
        ) => void
      }
    }
  }
}

export function GoogleSignInButton(props: GoogleSignInButtonProps) {
  const { nonce, signal, locale, onSuccess } = props
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()
  const containerRef = useRef<HTMLDivElement>(null)
  const initializedSignalRef = useRef<AbortSignal>(undefined)
  const successRef = useRef(onSuccess)

  useEffect(() => {
    successRef.current = onSuccess
  }, [onSuccess])

  useEffect(() => {
    const container = containerRef.current
    const google = (window as GoogleWindow).google

    if (!scriptLoadedSuccessfully || !container || !google || signal.aborted) {
      return
    }

    if (initializedSignalRef.current !== signal) {
      google.accounts.id.initialize({
        client_id: clientId,
        nonce,
        callback: (response) => {
          if (!signal.aborted) {
            successRef.current(response)
          }
        },
      })
      initializedSignalRef.current = signal
    }

    google.accounts.id.renderButton(container, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      locale,
    })

    return () => container.replaceChildren()
  }, [clientId, locale, nonce, signal, scriptLoadedSuccessfully])

  return <div ref={containerRef} style={{ height: 40 }} />
}
