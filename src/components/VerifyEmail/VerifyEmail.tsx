import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Loading } from 'components'
import { verifyEmail } from 'api'
import { PATH } from 'constants/index'
import toast from 'react-hot-toast'

export function VerifyEmail() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const code = queryParams.get('code')

  useEffect(() => {
    if (code) {
      verifyEmail(code)
        .then((verifyResult) => {
          toast.success(verifyResult, {
            id: 'verify-success',
          })
          navigate(`/${PATH.login}`, { replace: true })
        })
        .catch((error) => {
          toast.error(error as string, {
            id: 'verify-error',
          })
          navigate('/', { replace: true })
        })
    }
  }, [code, navigate])

  return <Loading text="Verifying..." />
}
