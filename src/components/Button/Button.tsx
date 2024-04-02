import { StyledButton, IconButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'

export function Button({ onClick, children, icon, ...props }: ButtonTypes) {
  if (icon) {
    return (
      <IconButton onClick={onClick} {...props}>
        <img src={icon} />
      </IconButton>
    )
  }

  return (
    <StyledButton onClick={onClick} {...props}>
      {children}
    </StyledButton>
  )
}
