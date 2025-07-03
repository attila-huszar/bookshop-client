import { useEffect, useRef } from 'react'
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
  const isEffectRun = useRef(false)

  useEffect(() => {
    if (isEffectRun.current || !token) return
    isEffectRun.current = true

    const verifyEmailToken = async () => {
      try {
        toast.loading('Verifying email...', { id: 'verify' })

        const response = await postVerifyEmail(token)

        toast.success(
          `${response.email} successfully verified, you can now log in.`,
          { id: 'verify' },
        )

        await navigate(`/${ROUTE.LOGIN}`, { replace: true })
      } catch (error) {
        const formattedError = await handleError({
          error,
          message: 'Verification failed, please try again later.',
        })

        toast.error(formattedError.message, { id: 'verify' })

        await navigate('/', { replace: true })
      }
    }

    void verifyEmailToken()
  }, [navigate, token])

  return <Loading text="Verifying" />
}
