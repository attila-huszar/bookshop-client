import { StyledButton, IconButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'

export function Button({ onClick, children, icon, ...props }: ButtonTypes) {
  return icon ? (
    <IconButton onClick={onClick} {...props}>
      <img src={icon} />
    </IconButton>
  ) : (
    <StyledButton onClick={onClick} {...props}>
      {children}
    </StyledButton>
  )
}
