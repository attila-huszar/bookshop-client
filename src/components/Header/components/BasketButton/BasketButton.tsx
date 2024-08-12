import { useNavigate } from 'react-router-dom'
import { StyledBasketButton, CartItemCount } from './BasketButton.styles'
import { Button } from 'components'
import { useCart } from 'hooks'
import { PATH } from 'constants/index'

export function BasketButton() {
  const { cartArray } = useCart()
  const navigate = useNavigate()

  return (
    <StyledBasketButton>
      <Button
        onClick={() => navigate(`/${PATH.cart}`)}
        $size="sm"
        $withCart
        title="Basket">
        Basket
      </Button>
      {cartArray?.length ? (
        <CartItemCount>
          {cartArray.reduce((acc, item) => acc + item.quantity, 0)}
        </CartItemCount>
      ) : null}
    </StyledBasketButton>
  )
}
