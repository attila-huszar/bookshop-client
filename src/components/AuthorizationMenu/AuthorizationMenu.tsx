import { NavLink } from 'react-router-dom'
import { LOGIN, REGISTRATION } from '../../routes/pathConstants'
import {
  StyledAuthorizationMenu,
  FormChangeLinks,
} from './AuthorizationMenu.styles'

export function AuthorizationMenu({ children }: React.PropsWithChildren) {
  return (
    <StyledAuthorizationMenu>
      <FormChangeLinks>
        <NavLink to={`/${LOGIN}`}>Log In</NavLink>
        <NavLink to={`/${REGISTRATION}`}>Register</NavLink>
      </FormChangeLinks>
      {children}
    </StyledAuthorizationMenu>
  )
}
