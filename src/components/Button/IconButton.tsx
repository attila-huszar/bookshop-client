import { StyledIconButton } from './IconButton.styles'
import type { IconButtonTypes } from './IconButton.types'

export function IconButton({
  onClick,
  icon,
  title,
  ...props
}: IconButtonTypes) {
  return (
    <StyledIconButton onClick={onClick} title={title} {...props}>
      {icon}
    </StyledIconButton>
  )
}
