import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Loading } from '@/components'
import { PATH } from '@/constants'

export function VerifyEmail() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const queryParams = new URLSearchParams(search)
  const code = queryParams.get('code')

  useEffect(() => {
    if (code) {
      // verifyEmail(code)
      //   .then((verifyResult) => {
      //     toast.success(verifyResult, {
      //       id: 'verify-success',
      //     })
      //     navigate(`/${PATH.login}`, { replace: true })
      //   })
      //   .catch((error: Error) => {
      //     toast.error(error.message, {
      //       id: 'verify-error',
      //     })
      //     navigate('/', { replace: true })
      //   })
    }
  }, [code, navigate])

  return <Loading text="Verifying" />
}
