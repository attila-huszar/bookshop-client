import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import type { CredentialResponse } from '@react-oauth/google'
import { postGoogleNonce } from '@/api/users'
import { toast } from '@/components/AppToaster'
import { googleClientId } from '@/constants/envConfig'
import { Divider, GoogleSignInWrapper } from './GoogleSignIn.style'

type GoogleSignInProps = {
  disabled: boolean
  onCredential: (credential: string) => Promise<void>
}

type GoogleChallenge = {
  nonce: string
  signal: AbortSignal
}

export function GoogleSignIn({ disabled, onCredential }: GoogleSignInProps) {
  const { t, i18n } = useTranslation()
  const controllerRef = useRef<AbortController | null>(null)
  const [challenge, setChallenge] = useState<GoogleChallenge>()

  useEffect(() => {
    controllerRef.current = new AbortController()

    return () => controllerRef.current?.abort()
  }, [])

  const handleLoadError = () => {
    const controller = controllerRef.current

    if (controller && !controller.signal.aborted) {
      toast.error(t('auth.googleUnavailable'))
    }
  }

  const prepareChallenge = async () => {
    const previousController = controllerRef.current

    if (!previousController || previousController.signal.aborted) {
      return
    }

    previousController.abort()

    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller

    setChallenge(undefined)

    try {
      const { nonce } = await postGoogleNonce(signal)

      if (!signal.aborted) {
        setChallenge({ nonce, signal })
      }
    } catch {
      if (!signal.aborted) {
        handleLoadError()
      }
    }
  }

  const handleSuccess = ({ credential }: CredentialResponse) => {
    if (!challenge || challenge.signal.aborted || disabled || !credential) {
      return
    }

    void onCredential(credential).finally(() => {
      if (!challenge.signal.aborted) {
        void prepareChallenge()
      }
    })
  }

  if (!googleClientId) {
    return null
  }

  return (
    <GoogleSignInWrapper disabled={disabled}>
      <Divider role="separator" aria-label={t('common.or')}>
        {t('common.or')}
      </Divider>
      <GoogleOAuthProvider
        clientId={googleClientId}
        locale={i18n.resolvedLanguage ?? 'en'}
        onScriptLoadSuccess={() => void prepareChallenge()}
        onScriptLoadError={handleLoadError}>
        {challenge && (
          <GoogleLogin
            key={challenge.nonce}
            nonce={challenge.nonce}
            theme="outline"
            size="large"
            shape="rectangular"
            text="continue_with"
            onSuccess={handleSuccess}
          />
        )}
      </GoogleOAuthProvider>
    </GoogleSignInWrapper>
  )
}
