import { AccountMenu, BasketButton, Menu, Search } from './components'
import { StyledHeader } from './Header.style'

export function Header() {
  return (
    <StyledHeader>
      <Menu />
      <Search />
      <AccountMenu />
      <BasketButton />
    </StyledHeader>
  )
}
