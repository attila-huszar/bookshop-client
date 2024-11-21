import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Loading } from '@/components'
import { PATH } from '@/constants'
import { postVerifyEmail } from '@/api/users'

export function VerifyEmail() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const token = queryParams.get('token')

  useEffect(() => {
    if (token) {
      postVerifyEmail(token)
        .then((verifyResult) => {
          toast.success(
            `${verifyResult.email} successfully verified, you can now login`,
            {
              id: 'verify-success',
            },
          )
          navigate(`/${PATH.CLIENT.login}`, { replace: true })
        })
        .catch((error: Error) => {
          toast.error(error.message, {
            id: 'verify-error',
          })
          navigate('/', { replace: true })
        })
    }
  }, [token, navigate])

  return <Loading text="Verifying" />
}
