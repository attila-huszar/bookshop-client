import { StyledIconButton } from './IconButton.style'
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
