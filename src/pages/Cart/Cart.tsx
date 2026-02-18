import { ChangeEvent, Fragment, useEffect, useRef } from 'react'
import { toast } from 'react-hot-toast'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import {
  cartClear,
  cartSelector,
  paymentClear,
  paymentCreate,
  paymentSelector,
} from '@/store'
import { Button, IconButton, InfoDialog, Loading, Price } from '@/components'
import {
  useAppDispatch,
  useAppSelector,
  useBreakpoints,
  useCart,
} from '@/hooks'
import { enforceMinMax, sessionStorageAdapter } from '@/helpers'
import {
  defaultCurrencySymbol,
  maxItemQuantity,
  paymentSessionKey,
} from '@/constants'
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
  const navigate = useNavigate()
  const {
    cartItems,
    removeFromCart,
    addQuantity,
    removeQuantity,
    setQuantity,
  } = useCart()
  const { cartIsLoading } = useAppSelector(cartSelector)
  const { payment, paymentIsLoading, paymentCreateError } =
    useAppSelector(paymentSelector)
  const { isMobile } = useBreakpoints()
  const dispatch = useAppDispatch()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (payment?.session) {
      void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
    }
  }, [payment?.session, navigate])

  useEffect(() => {
    if (paymentIsLoading) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [paymentIsLoading])

  useEffect(() => {
    if (paymentCreateError) {
      toast.error(paymentCreateError, {
        id: 'payment-error',
      })
    }
  }, [paymentCreateError])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const price = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  )

  const discountPrice = cartItems.reduce((acc, item) => {
    return acc + item.discountPrice * item.quantity
  }, 0)

  const discount = price - discountPrice

  const handleRemoveQuantity = (item: Cart) => {
    if (item.quantity > 0) {
      removeQuantity(item)
    }
  }

  const handleAddQuantity = (item: Cart) => {
    if (item.quantity < maxItemQuantity) {
      addQuantity(item)
    }
  }

  const handleSetQuantity = (
    cartItem: Cart,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newQuantity = enforceMinMax(event.target)
    setQuantity({ cartItem, newQuantity })
  }

  const handleCheckout = () => {
    if (cartItems.length && !paymentIsLoading) {
      const existingSession =
        sessionStorageAdapter.get<string>(paymentSessionKey)

      if (existingSession) {
        void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
      } else {
        const orderRequest = {
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }

        void dispatch(paymentCreate(orderRequest))
      }
    }
  }

  const handleCartClear = () => {
    dispatch(cartClear())
    dispatch(paymentClear())
  }

  const navigateToBooks = () => {
    void navigate(`/${ROUTE.BOOKS}`)
  }

  if (cartIsLoading) {
    return <Loading message="Loading Cart" />
  }

  if (cartItems.length) {
    return (
      <StyledCart>
        <h2>Cart</h2>
        <CartGrid>
          <HeaderRow>
            <p>Books in basket</p>
            <LabelQuantity>Quantity</LabelQuantity>
            <LabelPrice>Price</LabelPrice>
            <LabelPrice>Total</LabelPrice>
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
                  onClick={() => handleRemoveQuantity(item)}
                  icon={<MinusIcon />}
                  title="Remove quantity"
                  $size="sm"
                  $iconSize="sm"
                  $color="var(--grey)"
                  disabled={item.quantity <= 1}
                />
                <input
                  value={item.quantity}
                  onChange={(e) => handleSetQuantity(item, e)}
                  title="Set quantity"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={maxItemQuantity}
                />
                <IconButton
                  onClick={() => handleAddQuantity(item)}
                  icon={<PlusIcon />}
                  title="Add quantity"
                  $size="sm"
                  $iconSize="sm"
                  $color="var(--grey)"
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
                  onClick={() => removeFromCart(item)}
                  icon={<BinIcon />}
                  title="Remove from cart"
                  $size="sm"
                  $iconSize="sm"
                  $color="var(--orange)"
                />
              </RemoveItem>
            </Fragment>
          ))}
        </CartGrid>
        <TotalPrice>
          <h3>Price Summary</h3>
          {!!discount && (
            <div>
              <h4>Subtotal:</h4>
              <h4>
                {defaultCurrencySymbol} {price.toFixed(2)}
              </h4>
              <h4>Discount:</h4>
              <h4>
                {defaultCurrencySymbol} -{discount.toFixed(2)}
              </h4>
            </div>
          )}
          <div>
            <p>Total:</p>
            <p>
              {defaultCurrencySymbol} {discountPrice.toFixed(2)}
            </p>
          </div>
        </TotalPrice>
        <ButtonWrapper>
          <Button
            onClick={navigateToBooks}
            disabled={paymentIsLoading}
            $size={isMobile ? 'sm' : 'lg'}
            $textSize={isMobile ? 'sm' : 'lg'}
            $inverted>
            Back to Shop
          </Button>
          <IconButton
            icon={<BinIcon />}
            onClick={handleCartClear}
            disabled={paymentIsLoading}
            title="Reset Cart"
            $size={isMobile ? 'sm' : 'lg'}
            $iconSize={isMobile ? 'sm' : 'md'}
            $color="var(--mid-grey)"
            $outline
          />
          <Button
            onClick={handleCheckout}
            disabled={paymentIsLoading}
            $icon={paymentIsLoading ? <SpinnerIcon /> : <CartIcon />}
            $size={isMobile ? 'sm' : 'lg'}
            $textSize={isMobile ? 'sm' : 'lg'}
            $shadow>
            Checkout
          </Button>
        </ButtonWrapper>
        <InfoDialog dialogRef={ref} message="Checking out" />
      </StyledCart>
    )
  }

  return (
    <StyledCart>
      <h2>Cart</h2>
      <EmptyCart>
        <CartEmptyIcon />
        <p>Your cart is empty</p>
        <Button type="button" onClick={navigateToBooks} $icon={<CartIcon />}>
          Go Shopping
        </Button>
      </EmptyCart>
    </StyledCart>
  )
}
