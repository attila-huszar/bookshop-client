import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { HTTPError } from 'ky'
import { postVerifyEmail } from '@/api/users'
import { Loading } from '@/components'
import { PATH } from '@/constants'

export function VerifyEmail() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const token = queryParams.get('token')
  const isEffectRun = useRef(false)

  useEffect(() => {
    if (isEffectRun.current || !token) return
    isEffectRun.current = true

    if (token) {
      postVerifyEmail(token)
        .then((verifyResponse) => {
          toast.success(
            `${verifyResponse.email} successfully verified, you can now login`,
            {
              id: 'verify-success',
            },
          )
          void navigate(`/${PATH.CLIENT.login}`, { replace: true })
        })
        .catch(async (error) => {
          const errorMessage =
            error instanceof HTTPError
              ? (await error.response.json<{ error: string }>()).error
              : 'Verification failed, please try again later'

          toast.error(errorMessage, { id: 'verify-error' })

          void navigate('/', { replace: true })
        })
    }
  }, [token, navigate])

  return <Loading text="Verifying" />
}
