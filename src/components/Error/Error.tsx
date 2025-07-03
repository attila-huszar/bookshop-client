import { useNavigate } from 'react-router'
import { Button } from '../Button/Button'
import { StyledError } from './Error.style'
import { WarningIcon } from '@/assets/svg'

type Props = {
  text?: string
  error?: string
  fullScreen?: boolean
  backButton?: boolean
}

export function Error({
  text = 'Something went wrong. Please try again later.',
  error,
  fullScreen,
  backButton,
}: Props) {
  const navigate = useNavigate()

  async function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    if (hasPreviousPage) {
      await navigate(-1)
    } else {
      await navigate('/')
    }
  }

  return (
    <StyledError $fullScreen={fullScreen}>
      <WarningIcon />
      <div>
        <p>{text}</p>
        {error && <p>{error}</p>}
      </div>
      {backButton && (
        <Button type="button" onClick={() => void handleGoBack()}>
          Go Back
        </Button>
      )}
    </StyledError>
  )
}
