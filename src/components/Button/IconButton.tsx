import { StyledIconButton } from './IconButton.styles'
import type { IconButtonTypes } from './IconButton.types'

export function IconButton({ onClick, icon, label }: IconButtonTypes) {
  return (
    <StyledIconButton onClick={onClick} title={label}>
      {icon}
    </StyledIconButton>
  )
}
