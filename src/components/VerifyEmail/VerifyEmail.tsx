import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { HTTPError } from 'ky'
import { postVerifyEmail } from '@/api'
import { Loading } from '@/components'
import { ROUTE } from '@/routes'

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
        const verifyResponse = await postVerifyEmail(token)
        toast.success(
          `${verifyResponse.email} successfully verified, you can now login`,
          {
            id: 'verify-success',
          },
        )
        await navigate(`/${ROUTE.LOGIN}`, { replace: true })
      } catch (error) {
        let errorMessage = 'Verification failed, please try again later'

        if (error instanceof HTTPError) {
          const errorData = await error.response.json<{ error: string }>()
          errorMessage = errorData.error
        }

        toast.error(errorMessage, { id: 'verify-error' })
        await navigate('/', { replace: true })
      }
    }

    void verifyEmailToken()
  }, [navigate, token])

  return <Loading text="Verifying" />
}
