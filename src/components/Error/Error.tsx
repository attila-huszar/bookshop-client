import { StyledError } from './Error.style'
import WarningIcon from '@/assets/svg/warning.svg?react'

type Props = {
  text?: string
  error?: string
  fullScreen?: boolean
}

export function Error({
  text = 'Something went wrong. Please try again later.',
  error,
  fullScreen,
}: Props) {
  return (
    <StyledError $fullScreen={fullScreen}>
      <WarningIcon />
      <div>
        <p>{text}</p>
        {error && <p>{error}</p>}
      </div>
    </StyledError>
  )
}
