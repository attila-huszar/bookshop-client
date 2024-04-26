import { useNavigate } from 'react-router-dom'
import { Button } from '../../../../components'
import { StyledBasketButton, CartItemCount } from './BasketButton.styles'
import { useAppSelector } from '../../../../hooks'
import { cartSelector } from '../../../../store'
import { CART } from '../../../../routes/pathConstants'

export function BasketButton() {
  const cart = useAppSelector(cartSelector)
  const navigate = useNavigate()

  return (
    <StyledBasketButton>
      <Button
        onClick={() => navigate(`/${CART}`)}
        $size="sm"
        $withCart
        title="Basket">
        Basket
      </Button>
      {cart?.length ? <CartItemCount>{cart.length}</CartItemCount> : null}
    </StyledBasketButton>
  )
}
