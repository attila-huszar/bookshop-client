import { useNavigate } from 'react-router-dom'
import { StyledBasketButton, CartItemCount } from './BasketButton.style'
import { Button } from '@/components'
import { useAppSelector, useCart } from '@/hooks'
import { orderSelector } from '@/store'
import { PATH } from '@/constants'

export function BasketButton() {
  const { orderStatus } = useAppSelector(orderSelector)
  const { cartArray } = useCart()
  const navigate = useNavigate()

  return (
    <StyledBasketButton>
      <Button
        onClick={() => navigate(`/${PATH.cart}`)}
        $size="sm"
        $withCart
        title={orderStatus ? 'Checkout' : 'Basket'}>
        {orderStatus ? 'Checkout' : 'Basket'}
      </Button>
      {cartArray?.length ? (
        <CartItemCount>
          {cartArray.reduce((acc, item) => acc + item.quantity, 0)}
        </CartItemCount>
      ) : null}
    </StyledBasketButton>
  )
}
