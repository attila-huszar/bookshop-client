import { StyledButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'
import CartIcon from '../../assets/svg/cart.svg?react'

export function Button({ onClick, children, title, ...props }: ButtonTypes) {
  return (
    <StyledButton onClick={onClick} title={title} {...props}>
      {props.$withCart && <CartIcon />}
      {children}
    </StyledButton>
  )
}
