import { StyledButton, IconButton } from './Button.styles'
import type { ButtonTypes } from './Button.types'
import cartIcon from '../../assets/svg/cart.svg'

export function Button({ onClick, children, icon, ...props }: ButtonTypes) {
  return icon ? (
    <IconButton onClick={onClick} {...props}>
      <img src={icon} />
    </IconButton>
  ) : (
    <StyledButton onClick={onClick} {...props}>
      {props.$withCart && <img src={cartIcon} />}
      {children}
    </StyledButton>
  )
}
