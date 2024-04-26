import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../../hooks'
import { StyledBasketButton, CartItemCount } from './BasketButton.styles'
import { Button } from '../../../../components'
import { CART } from '../../../../routes/pathConstants'

export function BasketButton() {
  const { cart } = useCart()
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
      {cart?.length ? (
        <CartItemCount>
          {cart.reduce((acc, item) => acc + item.quantity, 0)}
        </CartItemCount>
      ) : null}
    </StyledBasketButton>
  )
}
