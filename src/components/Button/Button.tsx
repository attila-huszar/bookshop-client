import { StyledButton } from './Button.style'
import type { ButtonTypes } from './Button.types'
import { CartIcon, CartAddIcon, SpinnerIcon } from '@/assets/svg'

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
