import { StyledButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'
import CartIcon from '../../assets/svg/cart.svg?react'

export function Button({ onClick, children, label, ...props }: ButtonTypes) {
  return (
    <StyledButton onClick={onClick} title={label} {...props}>
      {props.$withCart && <CartIcon />}
      {children}
    </StyledButton>
  )
}
