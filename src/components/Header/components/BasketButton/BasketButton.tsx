import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { Button, IconButton } from '@/components/Button'
import { useAppSelector } from '@/hooks/redux'
import { useBreakpoints } from '@/hooks/useBreakpoints'
import { getCheckoutPaymentId } from '@/services/checkout'
import { CartIcon } from '@/assets/svg'
import { CartItemCount, StyledBasketButton } from './BasketButton.style'

export function BasketButton() {
  const { t } = useTranslation()

  const cartItems = useAppSelector((state) => state.cart.cartItems)
  const payment = useAppSelector((state) => state.payment.payment)
  const { isMobile } = useBreakpoints()
  const navigate = useNavigate()

  const storedPayment = getCheckoutPaymentId()
  const isCheckingOut = !!(payment ?? storedPayment)

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleCartClick = () => {
    void navigate(`/${ROUTE.CART}`)
  }

  return (
    <StyledBasketButton>
      {isMobile ? (
        <IconButton
          onClick={handleCartClick}
          icon={<CartIcon />}
          title={isCheckingOut ? t('checkout.title') : t('cart.title')}
        />
      ) : (
        <Button
          onClick={handleCartClick}
          $size="smMd"
          $icon={<CartIcon />}
          title={isCheckingOut ? t('checkout.title') : t('cart.title')}>
          {isCheckingOut ? t('checkout.title') : t('cart.title')}
        </Button>
      )}
      {cartCount > 0 && <CartItemCount>{cartCount}</CartItemCount>}
    </StyledBasketButton>
  )
}
