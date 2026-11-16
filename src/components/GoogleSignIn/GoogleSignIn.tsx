import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { i18n as appI18n } from '@/i18n'
import { useGoogleOAuth } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { postGoogleNonce } from '@/api/users'
import { toast } from '@/components/AppToaster'
import { googleClientId } from '@/constants/envConfig'
import { Divider, GoogleSignInWrapper } from './GoogleSignIn.style'
import { GoogleSignInButton } from './GoogleSignInButton'

type GoogleSignInProps = {
  disabled: boolean
  onCredential: (credential: string) => Promise<void>
}

type GoogleChallenge = {
  nonce: string
  signal: AbortSignal
}

export function GoogleSignIn(props: GoogleSignInProps) {
  if (!googleClientId) {
    return null
  }

  return <ConfiguredGoogleSignIn {...props} />
}

function ConfiguredGoogleSignIn({ disabled, onCredential }: GoogleSignInProps) {
  const { t, i18n } = useTranslation()
  const { scriptLoadedSuccessfully } = useGoogleOAuth()
  const [challenge, setChallenge] = useState<GoogleChallenge>()
  const controllerRef = useRef<AbortController>(null)
  const lifecycleRef = useRef<{ active: boolean }>(null)
  const pendingRef = useRef(false)

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    return () => {
      lifecycle.active = false
    }
  }, [])

  const prepareChallenge = useCallback(() => {
    if (!lifecycleRef.current?.active) {
      return
    }

    controllerRef.current?.abort()

    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller

    setChallenge(undefined)

    void postGoogleNonce(signal).then(
      ({ nonce }) => {
        if (!signal.aborted) {
          setChallenge({ nonce, signal })
        }
      },
      () => {
        if (!signal.aborted) {
          toast.error(appI18n.t('auth.googleUnavailable'))
        }
      },
    )
  }, [])

  useEffect(() => {
    if (!scriptLoadedSuccessfully) {
      return
    }

    let active = true

    // Let Strict Mode finish its effect replay before requesting a challenge.
    queueMicrotask(() => {
      if (active) {
        prepareChallenge()
      }
    })

    return () => {
      active = false
      controllerRef.current?.abort()
    }
  }, [scriptLoadedSuccessfully, prepareChallenge])

  const handleSuccess = ({ credential }: CredentialResponse) => {
    const lifecycle = lifecycleRef.current

    if (
      !lifecycle?.active ||
      !challenge ||
      challenge.signal.aborted ||
      disabled ||
      pendingRef.current ||
      !credential
    ) {
      return
    }

    pendingRef.current = true
    controllerRef.current?.abort()
    setChallenge(undefined)

    const finishAttempt = () => {
      pendingRef.current = false

      if (lifecycle.active) {
        prepareChallenge()
      }
    }

    void onCredential(credential).then(finishAttempt, finishAttempt)
  }

  return (
    <GoogleSignInWrapper disabled={disabled}>
      <Divider role="separator" aria-label={t('common.or')}>
        {t('common.or')}
      </Divider>
      {challenge && (
        <GoogleSignInButton
          nonce={challenge.nonce}
          signal={challenge.signal}
          locale={i18n.resolvedLanguage ?? 'en'}
          onSuccess={handleSuccess}
        />
      )}
    </GoogleSignInWrapper>
  )
}
