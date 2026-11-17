import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { googleLogin } from '@/store/thunks/auth'
import { toast } from '@/components/AppToaster'
import { GoogleSignIn } from '@/components/GoogleSignIn/GoogleSignIn'
import { useAppDispatch } from '@/hooks/redux'
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
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const pendingRef = useRef(false)
  const lifecycleRef = useRef<{ active: boolean }>(null)

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle

    return () => {
      lifecycle.active = false
    }
  }, [])

  const isSubmissionPending = useCallback(() => pendingRef.current, [])

  const startSubmission = useCallback(() => {
    if (!lifecycleRef.current?.active || pendingRef.current) {
      return false
    }

    pendingRef.current = true
    setIsSubmitting(true)

    return true
  }, [])

  const finishSubmission = useCallback(() => {
    pendingRef.current = false

    if (lifecycleRef.current?.active) {
      setIsSubmitting(false)
    }
  }, [])

  const handleGoogleSignIn = async (credential: string) => {
    const lifecycle = lifecycleRef.current

    if (!lifecycle?.active || !startSubmission()) {
      return
    }

    try {
      const { firstName } = await dispatch(googleLogin(credential)).unwrap()

      if (lifecycle.active) {
        toast.success(i18n.t('auth.welcome', { name: firstName }))
        void navigate(ROUTE.HOME, { replace: true })
      }
    } catch (error) {
      if (lifecycle.active) {
        toast.error(getErrorMessage(error, i18n.t('auth.loginError')))
      }
    } finally {
      finishSubmission()
    }
  }

  return (
    <StyledAuthorizationMenu>
      <FormChangeLinks>
        <NavLink to={`/${ROUTE.LOGIN}`}>{t('auth.login')}</NavLink>
        <NavLink to={`/${ROUTE.REGISTER}`}>{t('auth.register')}</NavLink>
      </FormChangeLinks>
      <Suspense fallback={null}>
        <Outlet
          context={
            {
              isSubmitting,
              isSubmissionPending,
              startSubmission,
              finishSubmission,
            } satisfies AuthSubmission
          }
        />
      </Suspense>
      {googleClientId && (
        <GoogleSignIn
          disabled={isSubmitting}
          onCredential={handleGoogleSignIn}
        />
      )}
    </StyledAuthorizationMenu>
  )
}
