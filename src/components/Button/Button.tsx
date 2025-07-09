import { StyledButton } from './Button.style'
import type { ButtonTypes } from './Button.types'

export function Button({
  onClick,
  children,
  title,
  $color,
  $icon,
  $iconPos = 'left',
  ...props
}: ButtonTypes) {
  const iconElement = $icon ? <div role="img">{$icon}</div> : null

  return (
    <StyledButton
      onClick={onClick}
      title={title}
      $color={$color}
      $iconPos={$iconPos}
      {...props}>
      {$iconPos === 'left' && iconElement}
      {children}
      {$iconPos === 'right' && iconElement}
    </StyledButton>
  )
}
