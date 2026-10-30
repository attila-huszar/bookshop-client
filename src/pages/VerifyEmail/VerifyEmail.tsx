import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { postVerifyEmail } from '@/api/users'
import { ROUTE } from '@/routes/route'
import { toast } from '@/components/AppToaster'
import { Loading } from '@/components/Loading'
import { getErrorMessage } from '@/helpers/errors'

export function VerifyEmail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { search } = useLocation()
  const token = new URLSearchParams(search).get('token')

  useEffect(() => {
    if (!token) {
      toast.error(i18n.t('errors.invalidToken'), { id: 'verify' })
      void navigate(ROUTE.HOME, { replace: true })

      return
    }

    let active = true

    void postVerifyEmail(token).then(
      (response) => {
        if (!active) {
          return
        }

        toast.success(i18n.t('auth.verified', { email: response.email }), {
          id: 'verify',
        })

        void navigate(`/${ROUTE.LOGIN}`, { replace: true })
      },
      (error: unknown) => {
        if (!active) {
          return
        }

        toast.error(getErrorMessage(error, i18n.t('auth.verifyError')), {
          id: 'verify',
        })

        void navigate(ROUTE.HOME, { replace: true })
      },
    )

    return () => {
      active = false
    }
  }, [navigate, token])

  return token ? <Loading message={t('auth.verifying')} fullScreen /> : null
}
