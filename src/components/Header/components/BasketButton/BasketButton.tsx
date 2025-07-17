import { useNavigate } from 'react-router'
import { StyledBasketButton, CartItemCount } from './BasketButton.style'
import { Button } from '@/components'
import { useAppSelector, useCart } from '@/hooks'
import { orderSelector } from '@/store'
import { ROUTE } from '@/routes'
import { CartIcon } from '@/assets/svg'

export function BasketButton() {
  const { order } = useAppSelector(orderSelector)
  const { cartArray } = useCart()
  const navigate = useNavigate()

  const navigateToCart = async () => {
    await navigate(`/${ROUTE.CART}`)
  }

  return (
    <StyledBasketButton>
      <Button
        onClick={() => void navigateToCart()}
        $size="smMd"
        $icon={<CartIcon />}
        title={order ? 'Checkout' : 'Basket'}>
        {order ? 'Checkout' : 'Basket'}
      </Button>
      {cartArray?.length ? (
        <CartItemCount>
          {cartArray.reduce((acc, item) => acc + item.quantity, 0)}
        </CartItemCount>
      ) : null}
    </StyledBasketButton>
  )
}
