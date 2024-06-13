import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyEmail } from 'api/fetchData'
import { PATH } from 'lib'
import { StyledVerifyEmail } from './VerifyEmail.styles'
import LoadingIcon from 'assets/svg/loading.svg?react'
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

  return (
    <StyledVerifyEmail>
      <LoadingIcon color="#fff" />
      <p>Verifying...</p>
    </StyledVerifyEmail>
  )
}
