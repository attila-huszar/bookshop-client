import { useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { cartSelector, orderSelector } from '@/store'
import { Button } from '@/components'
import { useAppSelector } from '@/hooks'
import { CartItem } from '@/types'
import { CartIcon } from '@/assets/svg'
import { CartItemCount, StyledBasketButton } from './BasketButton.style'

export function BasketButton() {
  const { cartItems } = useAppSelector(cartSelector)
  const { order } = useAppSelector(orderSelector)
  const navigate = useNavigate()

  const getInitialCartCount = (): number => {
    const cart = localStorage.getItem('cart')
    if (!cart) return 0

    try {
      const cartItems = JSON.parse(cart) as CartItem[]
      return cartItems.reduce((sum, item) => sum + item.quantity, 0)
    } catch {
      return 0
    }
  }

  const cartCount = cartItems.length
    ? cartItems.reduce((sum, item) => sum + item.quantity, 0)
    : getInitialCartCount()

  return (
    <StyledBasketButton>
      <Button
        onClick={() => void navigate(`/${ROUTE.CART}`)}
        $size="smMd"
        $icon={<CartIcon />}
        title={order ? 'Checkout' : 'Basket'}>
        {order ? 'Checkout' : 'Basket'}
      </Button>
      {cartCount > 0 && <CartItemCount>{cartCount}</CartItemCount>}
    </StyledBasketButton>
  )
}
