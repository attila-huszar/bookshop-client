import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { postVerifyEmail } from '@/api'
import { Loading } from '@/components'
import { ROUTE } from '@/routes'
import { handleError } from '@/errors'

export function VerifyEmail() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const token = queryParams.get('token')

  useEffect(() => {
    if (!token) return

    const controller = new AbortController()

    const verifyEmailToken = async () => {
      try {
        toast.loading('Verifying email...', { id: 'verify' })

        const response = await postVerifyEmail(token)

        if (controller.signal.aborted) return

        toast.success(
          `${response.email} successfully verified, you can now log in.`,
          { id: 'verify' },
        )

        void navigate(`/${ROUTE.LOGIN}`, { replace: true })
      } catch (error) {
        if (controller.signal.aborted) return

        const formattedError = await handleError({
          error,
          message: 'Verification failed, please try again later.',
        })

        toast.error(formattedError.message, { id: 'verify' })

        void navigate('/', { replace: true })
      }
    }

    void verifyEmailToken()

    return () => {
      controller.abort()
    }
  }, [navigate, token])

  return <Loading message="Verifying" />
}
