import { NavLink } from 'react-router-dom'
import {
  StyledAuthorizationMenu,
  FormChangeLinks,
} from './AuthorizationMenu.style'
import { PATH } from '@/constants'

export function AuthorizationMenu({ children }: React.PropsWithChildren) {
  return (
    <StyledAuthorizationMenu>
      <FormChangeLinks>
        <NavLink to={`/${PATH.login}`}>Login</NavLink>
        <NavLink to={`/${PATH.registration}`}>Register</NavLink>
      </FormChangeLinks>
      {children}
    </StyledAuthorizationMenu>
  )
}
