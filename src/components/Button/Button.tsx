import { StyledButton, IconButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'
import CartIcon from '../../assets/svg/cart.svg?react'

export function Button({ onClick, children, icon, ...props }: ButtonTypes) {
  return icon ? (
    <IconButton onClick={onClick} {...props}>
      <img src={icon} width={26} height={26} />
    </IconButton>
  ) : (
    <StyledButton onClick={onClick} {...props}>
      {props.$withCart && <CartIcon />}
      {children}
    </StyledButton>
  )
}
