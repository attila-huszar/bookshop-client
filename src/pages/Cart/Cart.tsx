import { type ChangeEvent, Fragment, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { i18n } from '@/i18n'
import { ROUTE } from '@/routes/route'
import {
  cartClear,
  cartQuantityAdd,
  cartQuantityRemove,
  cartQuantitySet,
  cartRemove,
} from '@/store/slices/cart'
import { Alert } from '@/components/Alert'
import { toast } from '@/components/AppToaster'
import { Button, IconButton } from '@/components/Button'
import { InfoDialog } from '@/components/InfoDialog'
import { Loading } from '@/components/Loading'
import { Price } from '@/components/Price'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useCart } from '@/hooks/useCart'
import { startCheckout } from '@/services/checkout'
import { formatAmount } from '@/helpers/checkout'
import { enforceMinMax } from '@/helpers/enforceMinMax'
import { getErrorMessage } from '@/helpers/errors'
import { scrollToTop } from '@/helpers/scrollToTop'
import {
  defaultCurrencySymbol,
  maxItemQuantity,
} from '@/constants/defaultValues'
import type { Cart } from '@/types'
import {
  BinIcon,
  CartEmptyIcon,
  CartIcon,
  imagePlaceholder,
  MinusIcon,
  PlusIcon,
  SpinnerIcon,
} from '@/assets/svg'
import {
  Book,
  ButtonWrapper,
  CartGrid,
  EmptyCart,
  HeaderRow,
  ImageWrapper,
  LabelPrice,
  LabelQuantity,
  PriceItem,
  PriceTotal,
  Quantity,
  RemoveItem,
  StyledCart,
  TotalPrice,
} from './Cart.style'

export function Cart() {
  const { t, i18n: translations } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    cartItems,
    isLoading: cartIsLoading,
    isFetching,
    error: cartError,
    refetch,
  } = useCart()
  const payment = useAppSelector((state) => state.payment.payment)
  const phase = useAppSelector((state) => state.payment.phase)
  const paymentIsLoading = phase === 'creating'
  const isCheckoutBusy =
    paymentIsLoading || phase === 'restoring' || phase === 'canceling'
  const dialogRef = useRef<HTMLDialogElement>(null)
  const lifecycleRef = useRef<{ active: boolean } | null>(null)

  useEffect(() => {
    const lifecycle = { active: true }
    lifecycleRef.current = lifecycle
    scrollToTop()

    return () => {
      lifecycle.active = false
    }
  }, [])

  useEffect(() => {
    if (payment?.paymentToken) {
      void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
    }
  }, [payment?.paymentToken, navigate])

  useEffect(() => {
    if (isCheckoutBusy) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [isCheckoutBusy])

  const price = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  )

  const discountPrice = cartItems.reduce((acc, item) => {
    return acc + item.discountPrice * item.quantity
  }, 0)

  const discount = price - discountPrice

  const handleSetQuantity = (
    cartItem: Cart,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newQuantity = enforceMinMax(event.target)
    dispatch(cartQuantitySet({ cartItem: { id: cartItem.id }, newQuantity }))
  }

  const handleCheckout = () => {
    const lifecycle = lifecycleRef.current

    if (isCheckoutBusy || isFetching || !lifecycle?.active) {
      return
    }

    if (!cartItems.length) {
      toast.error(t('cart.empty'), { id: 'cart-empty' })

      return
    }

    void dispatch(
      startCheckout({
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        expectedTotal: Math.round((discountPrice + Number.EPSILON) * 100) / 100,
      }),
    ).then(
      (result) => {
        if (lifecycle.active && result.type === 'existing') {
          void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
        }
      },
      (error: unknown) => {
        if (lifecycle.active) {
          toast.error(getErrorMessage(error, i18n.t('checkout.createError')), {
            id: 'payment-error',
          })
        }
      },
    )
  }

  const handleCartClear = () => {
    dispatch(cartClear())
  }

  const navigateToBooks = () => {
    void navigate(`/${ROUTE.BOOKS}`)
  }

  if (cartIsLoading) {
    return <Loading message={t('cart.loading')} fullScreen />
  }

  if (cartError) {
    return (
      <StyledCart>
        <h2>{t('cart.title')}</h2>
        <Alert message={t('cart.error')} error={cartError} backButton />
        <Button onClick={() => void refetch()}>
          {t('common.actions.refresh')}
        </Button>
      </StyledCart>
    )
  }

  if (cartItems.length) {
    return (
      <StyledCart>
        <h2>{t('cart.title')}</h2>
        <CartGrid>
          <HeaderRow>
            <p>{t('cart.books')}</p>
            <LabelQuantity>{t('common.fields.quantity')}</LabelQuantity>
            <LabelPrice>{t('common.fields.price')}</LabelPrice>
            <LabelPrice>{t('common.fields.total')}</LabelPrice>
          </HeaderRow>
          {cartItems.map((item: Cart, index) => (
            <Fragment key={item.id}>
              <Book $hasSeparator={index > 0}>
                <Link to={`/${ROUTE.BOOK}?id=${item.id}`}>
                  <ImageWrapper>
                    <img
                      src={item.imgUrl}
                      alt={item.title}
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = imagePlaceholder)
                      }
                    />
                  </ImageWrapper>
                  <p>{item.title}</p>
                </Link>
              </Book>
              <Quantity>
                <IconButton
                  onClick={() => dispatch(cartQuantityRemove({ id: item.id }))}
                  icon={<MinusIcon />}
                  title={t('cart.decrease')}
                  $size="sm"
                  $color="var(--color-on-surface-variant)"
                  disabled={item.quantity <= 1}
                />
                <input
                  value={item.quantity}
                  onChange={(e) => handleSetQuantity(item, e)}
                  title={t('cart.quantity')}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxItemQuantity}
                />
                <IconButton
                  onClick={() => dispatch(cartQuantityAdd({ id: item.id }))}
                  icon={<PlusIcon />}
                  title={t('cart.increase')}
                  $size="sm"
                  $color="var(--color-on-surface-variant)"
                  disabled={item.quantity >= maxItemQuantity}
                />
              </Quantity>
              <PriceItem>
                <Price
                  component="cart"
                  price={item.price}
                  discount={item.discount}
                />
              </PriceItem>
              <PriceTotal>
                <Price
                  component="cart"
                  price={item.quantity * item.price}
                  discount={item.discount}
                />
              </PriceTotal>
              <RemoveItem>
                <IconButton
                  onClick={() => dispatch(cartRemove({ id: item.id }))}
                  icon={<BinIcon />}
                  title={t('cart.remove')}
                  $size="sm"
                  $color="var(--color-error)"
                />
              </RemoveItem>
            </Fragment>
          ))}
        </CartGrid>
        <TotalPrice>
          <h3>{t('cart.summary')}</h3>
          {!!discount && (
            <div>
              <h4>{t('cart.subtotal')}</h4>
              <h4>
                {defaultCurrencySymbol}{' '}
                {formatAmount(price, translations.resolvedLanguage)}
              </h4>
              <h4>{t('cart.discount')}</h4>
              <h4>
                {defaultCurrencySymbol} -
                {formatAmount(discount, translations.resolvedLanguage)}
              </h4>
            </div>
          )}
          <div>
            <p>{t('cart.total')}</p>
            <p>
              {defaultCurrencySymbol}{' '}
              {formatAmount(discountPrice, translations.resolvedLanguage)}
            </p>
          </div>
        </TotalPrice>
        <ButtonWrapper>
          <Button
            onClick={navigateToBooks}
            disabled={isCheckoutBusy || isFetching}
            $inverted>
            {t('common.actions.backToShop')}
          </Button>
          <IconButton
            icon={<BinIcon />}
            onClick={handleCartClear}
            disabled={isCheckoutBusy || isFetching}
            title={t('cart.reset')}
            $color="var(--color-outline)"
            $outline
          />
          <Button
            onClick={handleCheckout}
            disabled={isCheckoutBusy || isFetching}
            $icon={isCheckoutBusy ? <SpinnerIcon /> : <CartIcon />}
            $shadow>
            {isCheckoutBusy ? t('cart.checkingOut') : t('checkout.title')}
          </Button>
        </ButtonWrapper>
        <InfoDialog
          dialogRef={dialogRef}
          message={paymentIsLoading ? t('cart.creating') : t('cart.ready')}
        />
      </StyledCart>
    )
  }

  return (
    <StyledCart>
      <h2>{t('cart.title')}</h2>
      <EmptyCart>
        <CartEmptyIcon />
        <p>{t('cart.empty')}</p>
        <Button type="button" onClick={navigateToBooks} $icon={<CartIcon />}>
          {t('cart.shop')}
        </Button>
      </EmptyCart>
    </StyledCart>
  )
}
