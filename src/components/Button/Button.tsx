import { StyledButton } from './Button.style'
import type { ButtonTypes } from './Button.types'
import CartIcon from '@/assets/svg/cart.svg?react'
import CartAddIcon from '@/assets/svg/cart_add.svg?react'
import SpinnerIcon from '@/assets/svg/spinner.svg?react'

export function Button({ onClick, children, title, ...props }: ButtonTypes) {
  return (
    <StyledButton onClick={onClick} title={title} {...props}>
      {props.$withCart && (
        <div role="img">
          <CartIcon />
        </div>
      )}
      {props.$withCartAdd && (
        <div role="img">
          <CartAddIcon />
        </div>
      )}
      {props.$spinner && (
        <div role="img">
          <SpinnerIcon />
        </div>
      )}
      {children}
    </StyledButton>
  )
}
