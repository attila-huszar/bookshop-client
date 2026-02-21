import { useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router'
import { postVerifyEmail } from '@/api'
import { ROUTE } from '@/routes'
import { Loading } from '@/components/Loading/Loading'
import { handleError } from '@/errors/handleError'

export function VerifyEmail() {
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
        toast.loading('Verifying email...', { id: 'verify' })

        const response = await postVerifyEmail(token)

        toast.success(
          `${response.email} successfully verified, you can now log in.`,
          { id: 'verify' },
        )

        void navigate(`/${ROUTE.LOGIN}`, { replace: true })
      } catch (error) {
        const formattedError = await handleError({
          error,
          message: 'Verification failed, please try again later.',
        })

        toast.error(formattedError.message, { id: 'verify' })

        void navigate('/', { replace: true })
      }
    }

    void verifyEmailToken()
  }, [navigate, token])

  return <Loading message="Verifying" />
}
