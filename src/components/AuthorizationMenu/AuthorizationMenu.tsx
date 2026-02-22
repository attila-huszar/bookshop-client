import { PropsWithChildren } from 'react'
import { NavLink } from 'react-router'
import { ROUTE } from '@/routes'
import {
  FormChangeLinks,
  StyledAuthorizationMenu,
} from './AuthorizationMenu.style'

export function AuthorizationMenu({ children }: PropsWithChildren) {
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
