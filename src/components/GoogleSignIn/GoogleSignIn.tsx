import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGoogleOAuth } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { postGoogleNonce } from '@/api/users'
import { toast } from '@/components/AppToaster'
import { Divider, GoogleSignInWrapper } from './GoogleSignIn.style'

type GoogleSignInProps = {
  disabled: boolean
  onCredential: (credential: string) => Promise<void>
}

export function GoogleSignIn({ disabled, onCredential }: GoogleSignInProps) {
  const { t, i18n } = useTranslation()
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth()
  const [buttonSignal, setButtonSignal] = useState<AbortSignal>()
  const containerRef = useRef<HTMLDivElement>(null)
  const locale = i18n.resolvedLanguage ?? 'en'

  const reportUnavailable = useEffectEvent(() => {
    toast.error(t('auth.googleUnavailable'))
  })

  const handleCredential = useEffectEvent(
    ({ credential }: CredentialResponse, controller: AbortController) => {
      if (disabled || !credential) {
        return
      }

      // Consume this challenge immediately so duplicate callbacks are ignored.
      controller.abort()
      setButtonSignal(undefined)

      return onCredential(credential)
    },
  )

  useEffect(() => {
    const google = window.google?.accounts.id

    if (!scriptLoadedSuccessfully || !google) {
      return
    }

    let active = true
    let controller: AbortController | undefined

    const prepareChallenge = async () => {
      if (!active) {
        return
      }

      const challengeController = new AbortController()
      controller = challengeController
      const { signal } = challengeController

      try {
        const { nonce } = await postGoogleNonce(signal)

        if (signal.aborted) {
          return
        }

        google.initialize({
          client_id: clientId,
          nonce,
          callback: (response) => {
            if (!active || signal.aborted) {
              return
            }

            const submission = handleCredential(response, challengeController)

            if (submission) {
              void submission.catch(() => undefined).finally(prepareChallenge)
            }
          },
        })
        setButtonSignal(signal)
      } catch {
        if (!signal.aborted) {
          reportUnavailable()
        }
      }
    }

    // Let Strict Mode finish its effect replay before requesting a challenge.
    queueMicrotask(() => {
      void prepareChallenge()
    })

    return () => {
      active = false
      controller?.abort()
    }
  }, [clientId, scriptLoadedSuccessfully])

  useEffect(() => {
    const container = containerRef.current
    const google = window.google?.accounts.id

    if (!container || !google || !buttonSignal || buttonSignal.aborted) {
      return
    }

    google.renderButton(container, {
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      locale,
    })

    return () => container.replaceChildren()
  }, [buttonSignal, locale])

  return (
    <GoogleSignInWrapper disabled={disabled}>
      <Divider role="separator" aria-label={t('common.or')}>
        {t('common.or')}
      </Divider>
      {buttonSignal && <div ref={containerRef} style={{ height: 40 }} />}
    </GoogleSignInWrapper>
  )
}
