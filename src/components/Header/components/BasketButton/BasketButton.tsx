import { useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { cartSelector, paymentSelector } from '@/store'
import { Button, IconButton } from '@/components'
import { useAppSelector, useBreakpoints } from '@/hooks'
import { sessionStorageAdapter } from '@/helpers'
import { paymentIdKey } from '@/constants'
import type { Cart } from '@/types'
import { CartIcon } from '@/assets/svg'
import { CartItemCount, StyledBasketButton } from './BasketButton.style'

export function BasketButton() {
  const { cartItems } = useAppSelector(cartSelector)
  const { payment } = useAppSelector(paymentSelector)
  const { isMobile } = useBreakpoints()
  const navigate = useNavigate()

  const storedPayment = sessionStorageAdapter.get(paymentIdKey)
  const isCheckingOut = !!(payment ?? storedPayment)

  const calculateCartQuantity = (items: Cart[]): number =>
    items.reduce((sum, item) => sum + item.quantity, 0)

  const cartCount = calculateCartQuantity(cartItems)

  const handleCartClick = () => {
    void navigate(`/${ROUTE.CART}`)
  }

  return (
    <StyledBasketButton>
      {isMobile ? (
        <IconButton
          onClick={handleCartClick}
          icon={<CartIcon />}
          title={isCheckingOut ? 'Checkout' : 'Basket'}
        />
      ) : (
        <Button
          onClick={handleCartClick}
          $size="smMd"
          $icon={<CartIcon />}
          title={isCheckingOut ? 'Checkout' : 'Basket'}>
          {isCheckingOut ? 'Checkout' : 'Basket'}
        </Button>
      )}
      {cartCount > 0 && <CartItemCount>{cartCount}</CartItemCount>}
    </StyledBasketButton>
  )
}
