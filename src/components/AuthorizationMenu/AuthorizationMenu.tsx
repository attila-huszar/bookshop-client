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
        <NavLink to={`/${PATH.CLIENT.login}`}>Login</NavLink>
        <NavLink to={`/${PATH.CLIENT.register}`}>Register</NavLink>
      </FormChangeLinks>
      {children}
    </StyledAuthorizationMenu>
  )
}
