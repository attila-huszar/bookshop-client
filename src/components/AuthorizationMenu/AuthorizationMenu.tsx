import { NavLink } from 'react-router'
import {
  StyledAuthorizationMenu,
  FormChangeLinks,
} from './AuthorizationMenu.style'
import { ROUTE } from '@/routes'

export function AuthorizationMenu({ children }: React.PropsWithChildren) {
  return (
    <StyledAuthorizationMenu>
      <FormChangeLinks>
        <NavLink to={`/${ROUTE.LOGIN}`}>Login</NavLink>
        <NavLink to={`/${ROUTE.REGISTER}`}>Register</NavLink>
      </FormChangeLinks>
      {children}
    </StyledAuthorizationMenu>
  )
}
