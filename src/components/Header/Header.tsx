import { useNavigate } from 'react-router-dom'
import { StyledHeader, ExtraSpace } from './Header.styles'
import { Button } from '../../components'
import { Menu } from './components/Menu/Menu'
import { Search } from './components/Search/Search'
import { Account } from './components/Account/Account'
import { Favorite } from './components/Favorite/Favorite'
import { CART } from '../../routes/pathConstants'

export function Header() {
  const navigate = useNavigate()

  return (
    <>
      <ExtraSpace />
      <StyledHeader>
        <Menu />
        <Search />
        <Account />
        <Favorite />
        <Button onClick={() => navigate(`/${CART}`)} $withCart title="Basket">
          Basket
        </Button>
      </StyledHeader>
    </>
  )
}
