import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { userSelector } from '@/store/selectors'
import { googleLogin } from '@/store/thunks/auth'
import { toast } from '@/components/AppToaster'
import { GoogleSignIn } from '@/components/GoogleSignIn/GoogleSignIn'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getErrorMessage } from '@/helpers/errors'
import { googleClientId } from '@/constants/envConfig'
import {
  FormChangeLinks,
  StyledAuthorizationMenu,
} from './AuthorizationMenu.style'
import type { AuthSubmission } from './AuthorizationMenu.types'

export function AuthorizationMenu() {
  const { t, i18n } = useTranslation()
  const dispatch = useAppDispatch()
  const isSessionLoading = useAppSelector(
    (state) => userSelector(state).userIsLoading,
  )
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitDisabled = isSessionLoading || isSubmitting
  const submissionLockRef = useRef(false)
  const lifecycleRef = useRef<{ active: boolean }>(null)

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    return () => {
      lifecycle.active = false
    }
  }, [])

  const hasActiveSubmission = useCallback(() => submissionLockRef.current, [])

  const runSubmission: AuthSubmission['runSubmission'] = async (submit) => {
    const canSubmit =
      lifecycleRef.current?.active &&
      !isSessionLoading &&
      !submissionLockRef.current

    if (!canSubmit) {
      return
    }

    submissionLockRef.current = true
    setIsSubmitting(true)

    try {
      await submit()
    } finally {
      submissionLockRef.current = false

      if (lifecycleRef.current?.active) {
        setIsSubmitting(false)
      }
    }
  }

  const handleGoogleSignIn = async (credential: string) => {
    const lifecycle = lifecycleRef.current

    await runSubmission(async () => {
      try {
        const { firstName } = await dispatch(googleLogin(credential)).unwrap()

        if (lifecycle?.active) {
          toast.success(i18n.t('auth.welcome', { name: firstName }))
          void navigate(ROUTE.HOME, { replace: true })
        }
      } catch (error) {
        if (lifecycle?.active) {
          toast.error(getErrorMessage(error, i18n.t('auth.loginError')))
        }
      }
    })
  }

  const authSubmission: AuthSubmission = {
    isSubmitting,
    isSessionLoading,
    hasActiveSubmission,
    runSubmission,
  }

  return (
    <StyledAuthorizationMenu>
      <FormChangeLinks>
        <NavLink to={`/${ROUTE.LOGIN}`}>{t('auth.login')}</NavLink>
        <NavLink to={`/${ROUTE.REGISTER}`}>{t('auth.register')}</NavLink>
      </FormChangeLinks>
      <Suspense fallback={null}>
        <Outlet context={authSubmission} />
      </Suspense>
      {googleClientId && (
        <GoogleSignIn
          disabled={submitDisabled}
          onCredential={handleGoogleSignIn}
        />
      )}
    </StyledAuthorizationMenu>
  )
}
