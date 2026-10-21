import { useEffect, useRef } from 'react'
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
  const queryParams = new URLSearchParams(search)
  const token = queryParams.get('token')
  const hasVerified = useRef(false)

  useEffect(() => {
    if (!token || hasVerified.current) return

    hasVerified.current = true

    const verifyEmailToken = async () => {
      try {
        toast.loading(i18n.t('auth.verifyingEmail'), { id: 'verify' })

        const response = await postVerifyEmail(token)

        toast.success(i18n.t('auth.verified', { email: response.email }), {
          id: 'verify',
        })

        void navigate(`/${ROUTE.LOGIN}`, { replace: true })
      } catch (error) {
        toast.error(getErrorMessage(error, i18n.t('auth.verifyError')), {
          id: 'verify',
        })

        void navigate('/', { replace: true })
      }
    }

    void verifyEmailToken()
  }, [navigate, token])

  return <Loading message={t('auth.verifying')} fullScreen />
}
