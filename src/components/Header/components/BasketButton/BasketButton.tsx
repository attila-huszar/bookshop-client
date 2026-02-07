import { useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { cartSelector, paymentSelector } from '@/store'
import { Button } from '@/components'
import { useAppSelector } from '@/hooks'
import { localStorageAdapter } from '@/helpers'
import { cartKey } from '@/constants'
import { CartItem } from '@/types'
import { CartIcon } from '@/assets/svg'
import { CartItemCount, StyledBasketButton } from './BasketButton.style'

export function BasketButton() {
  const { cartItems } = useAppSelector(cartSelector)
  const { payment } = useAppSelector(paymentSelector)
  const navigate = useNavigate()

  const calculateCartQuantity = (items: CartItem[] | null): number =>
    items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const cartCount = calculateCartQuantity(
    cartItems.length ? cartItems : localStorageAdapter.get<CartItem[]>(cartKey),
  )

  return (
    <StyledBasketButton>
      <Button
        onClick={() => void navigate(`/${ROUTE.CART}`)}
        $size="smMd"
        $icon={<CartIcon />}
        title={payment ? 'Checkout' : 'Basket'}>
        {payment ? 'Checkout' : 'Basket'}
      </Button>
      {cartCount > 0 && <CartItemCount>{cartCount}</CartItemCount>}
    </StyledBasketButton>
  )
}
