import { useContext, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { i18n as appI18n } from '@/i18n'
import type { CredentialResponse } from '@react-oauth/google'
import { toast } from '@/components/AppToaster'
import { googleClientId } from '@/constants/envConfig'
import { GoogleSignInContext } from './GoogleSignIn.context'
import { Divider, GoogleSignInWrapper } from './GoogleSignIn.style'
import { GoogleSignInButton } from './GoogleSignInButton'

type GoogleSignInProps = {
  disabled: boolean
  onCredential: (credential: string) => Promise<void>
}

export function GoogleSignIn({ disabled, onCredential }: GoogleSignInProps) {
  const { t, i18n } = useTranslation()
  const context = useContext(GoogleSignInContext)
  const controllerRef = useRef<AbortController>(null)
  const pendingRef = useRef(false)
  const errorShownRef = useRef(false)
  const scriptStatus = context?.scriptStatus
  const ensureChallenge = context?.ensureChallenge
  const hasError = scriptStatus === 'error' || context?.nonceFailed === true

  useEffect(() => {
    const controller = new AbortController()
    controllerRef.current = controller

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (scriptStatus === 'ready') {
      ensureChallenge?.()
    }
  }, [scriptStatus, ensureChallenge])

  useEffect(() => {
    if (hasError && !errorShownRef.current) {
      toast.error(appI18n.t('auth.googleUnavailable'))
    }

    errorShownRef.current = hasError
  }, [hasError])

  const handleSuccess = ({ credential }: CredentialResponse) => {
    const signal = controllerRef.current?.signal

    if (
      !signal ||
      signal.aborted ||
      disabled ||
      pendingRef.current ||
      !credential
    ) {
      return
    }

    pendingRef.current = true
    context?.invalidateChallenge()

    const finishAttempt = () => {
      pendingRef.current = false

      if (!signal.aborted) {
        context?.renewChallenge()
      }
    }

    void onCredential(credential).then(finishAttempt, finishAttempt)
  }

  if (!googleClientId) {
    return null
  }

  return (
    <GoogleSignInWrapper disabled={disabled}>
      <Divider role="separator" aria-label={t('common.or')}>
        {t('common.or')}
      </Divider>
      {context?.challenge && (
        <GoogleSignInButton
          locale={i18n.resolvedLanguage ?? 'en'}
          onSuccess={handleSuccess}
        />
      )}
    </GoogleSignInWrapper>
  )
}
