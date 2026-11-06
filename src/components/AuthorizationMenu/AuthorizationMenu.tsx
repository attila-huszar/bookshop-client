import { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { ROUTE } from '@/routes/route'
import {
  FormChangeLinks,
  StyledAuthorizationMenu,
} from './AuthorizationMenu.style'

export function AuthorizationMenu({ children }: PropsWithChildren) {
  const { t } = useTranslation()

  return (
    <StyledAuthorizationMenu>
      <FormChangeLinks>
        <NavLink to={`/${ROUTE.LOGIN}`}>{t('auth.login')}</NavLink>
        <NavLink to={`/${ROUTE.REGISTER}`}>{t('auth.register')}</NavLink>
      </FormChangeLinks>
      {children}
    </StyledAuthorizationMenu>
  )
}
