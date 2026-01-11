import { useNavigate } from 'react-router'
import { WarningIcon } from '@/assets/svg'
import { Button } from '../Button/Button'
import { StyledAlert } from './Alert.style'

type Props = {
  message?: string
  error?: string
  fullScreen?: boolean
  backButton?: boolean
}

export function Alert({
  message = 'Something went wrong. Please try again later.',
  error,
  fullScreen = false,
  backButton,
}: Props) {
  const navigate = useNavigate()

  const handleGoBack = () => {
    const hasPreviousPage = window.history.length > 2
    if (hasPreviousPage) {
      void navigate(-1)
    } else {
      void navigate('/')
    }
  }

  return (
    <StyledAlert $fullScreen={fullScreen}>
      <WarningIcon />
      <div>
        <p>{message}</p>
        {error && <p>{error}</p>}
      </div>
      {backButton && (
        <Button type="button" onClick={handleGoBack}>
          Go Back
        </Button>
      )}
    </StyledAlert>
  )
}
