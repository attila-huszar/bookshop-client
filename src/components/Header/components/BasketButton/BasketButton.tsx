import { useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { cartSelector, paymentSelector } from '@/store'
import { Button, IconButton } from '@/components'
import { useAppSelector, useBreakpoints } from '@/hooks'
import { localStorageAdapter, sessionStorageAdapter } from '@/helpers'
import { cartKey, paymentIdKey } from '@/constants'
import { MinimalCart } from '@/types'
import { CartIcon } from '@/assets/svg'
import { CartItemCount, StyledBasketButton } from './BasketButton.style'

export function BasketButton() {
  const { cartItems } = useAppSelector(cartSelector)
  const { payment } = useAppSelector(paymentSelector)
  const { isMobile } = useBreakpoints()
  const navigate = useNavigate()

  const storedPayment = sessionStorageAdapter.get(paymentIdKey)
  const isCheckingOut = !!(payment ?? storedPayment)

  const calculateCartQuantity = (items: MinimalCart[] | null): number =>
    items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  const storedCart = localStorageAdapter.get<MinimalCart[]>(cartKey)
  const safeStoredCart = Array.isArray(storedCart) ? storedCart : null

  const cartCount = calculateCartQuantity(
    cartItems.length ? cartItems : safeStoredCart,
  )

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
