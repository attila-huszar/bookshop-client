import { StyledHeader, ExtraSpace } from './Header.style'
import { AccountMenu, BasketButton, Favorite, Menu, Search } from './components'

export function Header() {
  return (
    <>
      <ExtraSpace />
      <StyledHeader>
        <Menu />
        <Search />
        <AccountMenu />
        <Favorite />
        <BasketButton />
      </StyledHeader>
    </>
  )
}
