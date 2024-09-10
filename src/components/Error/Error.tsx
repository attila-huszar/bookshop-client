import { StyledError } from './Error.styles'
import WarningIcon from '@/assets/svg/warning.svg?react'

export function Error({ text, error }: { text: string; error?: string }) {
  return (
    <StyledError>
      <WarningIcon />
      <div>
        <p>{text}</p>
        <p>{error}</p>
      </div>
    </StyledError>
  )
}
