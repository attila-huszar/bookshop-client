import { NavLink, useLocation } from 'react-router-dom'
import { LOGIN, REGISTRATION } from '../../routes/pathConstants'
import {
  StyledLoginAndRegister,
  FormChangeWrapper,
} from './LoginAndRegister.styles'
import { Login } from '../Login/Login'
import { Registration } from '../Registration/Registration'

export function LoginAndRegister() {
  const location = useLocation()

  return (
    <StyledLoginAndRegister>
      <FormChangeWrapper>
        <NavLink to={`/${LOGIN}`}>Log In</NavLink>
        <NavLink to={`/${REGISTRATION}`}>Register</NavLink>
      </FormChangeWrapper>

      {location.pathname === `/${LOGIN}` ? <Login /> : null}
      {location.pathname === `/${REGISTRATION}` ? <Registration /> : null}
    </StyledLoginAndRegister>
  )
}
