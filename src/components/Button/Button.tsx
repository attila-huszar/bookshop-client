import { StyledButton, IconButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'
import CartIcon from '../../assets/svg/cart.svg?react'

export function Button({
  onClick,
  children,
  icon,
  label,
  ...props
}: ButtonTypes) {
  return icon ? (
    <IconButton onClick={onClick} title={label}>
      {icon}
    </IconButton>
  ) : (
    <StyledButton onClick={onClick} title={label} {...props}>
      {props.$withCart && <CartIcon />}
      {children}
    </StyledButton>
  )
}
