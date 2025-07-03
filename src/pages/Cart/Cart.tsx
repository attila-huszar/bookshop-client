import { Fragment, ChangeEvent, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import { useAppDispatch, useAppSelector, useCart } from '@/hooks'
import {
  cartClear,
  cartSelector,
  orderClear,
  orderCreate,
  orderSelector,
  userSelector,
} from '@/store'
import { Button, IconButton, InfoDialog, Loading, Price } from '@/components'
import {
  StyledCart,
  CartGrid,
  TotalPrice,
  ButtonWrapper,
  Book,
  Quantity,
  PriceItem,
  RemoveItem,
  ImageWrapper,
  PriceTotal,
  LabelQuantity,
  LabelPrice,
  EmptyCart,
} from './Cart.style'
import { ROUTE } from '@/routes'
import { currencyOptions } from '@/constants'
import { enforceMinMax, calcSubtotalOrDiscount } from '@/helpers'
import { OrderStatus } from '@/types'
import type { Cart, PostPaymentIntent, Order } from '@/types'
import {
  MinusIcon,
  PlusIcon,
  BinIcon,
  CartEmptyIcon,
  imagePlaceholder,
} from '@/assets/svg'

const calculateTotalAmount = (cartArray: Cart[]): number => {
  return cartArray.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )
}

const createStripeIntent = (
  amount: number,
  currency: string = currencyOptions.usd,
): PostPaymentIntent => {
  return {
    amount: Math.round(amount * 100),
    currency,
    description: 'Book Shop Order',
  }
}

export function Cart() {
  const navigate = useNavigate()
  const {
    cartArray,
    removeFromCart,
    addQuantity,
    removeQuantity,
    setQuantity,
  } = useCart()
  const { cartIsLoading } = useAppSelector(cartSelector)
  const { order, orderIsLoading, orderCreateError } =
    useAppSelector(orderSelector)
  const { userData } = useAppSelector(userSelector)
  const dispatch = useAppDispatch()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const redirectToCheckout = async () => {
      if (order?.clientSecret) {
        await navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
      }
    }

    void redirectToCheckout()
  }, [order?.clientSecret, navigate])

  useEffect(() => {
    if (orderIsLoading) {
      ref.current?.showModal()
    } else {
      ref.current?.close()
    }
  }, [orderIsLoading])

  useEffect(() => {
    if (orderCreateError) {
      toast.error(orderCreateError, {
        id: 'order-error',
      })
    }
  }, [orderCreateError])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const subtotal = calcSubtotalOrDiscount(cartArray, 'subtotal')
  const discount = calcSubtotalOrDiscount(cartArray, 'discount')

  const handleRemoveQuantity = (item: Cart) => {
    if (item.quantity > 0) {
      removeQuantity(item)
    }
  }

  const handleAddQuantity = (item: Cart) => {
    if (item.quantity < 50) {
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
    if (cartArray.length) {
      const total = calculateTotalAmount(cartArray)
      const orderToStripe = createStripeIntent(total)
      const { firstName, lastName, email, phone, address } = { ...userData }

      const orderToServer: Order = {
        paymentId: '',
        paymentIntentStatus: 'processing',
        orderStatus: OrderStatus.Pending,
        total: Number(total.toFixed(2)),
        currency: currencyOptions.usd,
        items: cartArray,
        firstName,
        lastName,
        email,
        phone,
        address,
      }

      void dispatch(orderCreate({ orderToStripe, orderToServer }))
    }
  }

  const handleCartClear = () => {
    dispatch(cartClear())
    dispatch(orderClear())
  }

  const navigateToBooks = async () => {
    await navigate(`/${ROUTE.BOOKS}`)
  }

  if (cartIsLoading) {
    return <Loading text="Loading Cart" />
  }

  if (cartArray.length) {
    return (
      <StyledCart>
        <h2>Cart</h2>
        <CartGrid>
          <p>Books in basket</p>
          <LabelQuantity>Quantity</LabelQuantity>
          <LabelPrice>Price</LabelPrice>
          <LabelPrice>Total</LabelPrice>
          {cartArray.map((item: Cart) => (
            <Fragment key={item.id}>
              <Book>
                <Link to={`/${ROUTE.BOOKS}/${item.id}`}>
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
                  max={50}
                />
                <IconButton
                  onClick={() => handleAddQuantity(item)}
                  icon={<PlusIcon />}
                  title="Add quantity"
                  $size="sm"
                  $iconSize="sm"
                  $color="var(--grey)"
                  disabled={item.quantity >= 50}
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
              <h4>$ {subtotal.toFixed(2)}</h4>
              <h4>Discount:</h4>
              <h4>$ -{discount.toFixed(2)}</h4>
            </div>
          )}
          <div>
            <p>Total:</p>
            <p>$ {(subtotal - discount).toFixed(2)}</p>
          </div>
        </TotalPrice>
        <ButtonWrapper>
          <Button
            onClick={() => void navigateToBooks()}
            disabled={orderIsLoading}
            $size="lg"
            $textSize="lg"
            $inverted>
            Back to Shop
          </Button>
          <IconButton
            icon={<BinIcon />}
            onClick={handleCartClear}
            disabled={orderIsLoading}
            title="Reset Cart"
            $size="lg"
            $color="var(--primary-color)"
            $outline
          />
          <Button
            onClick={handleCheckout}
            disabled={orderIsLoading}
            $spinner={orderIsLoading}
            $withCart={!orderIsLoading}
            $size="lg"
            $textSize="lg"
            $shadowed>
            Checkout
          </Button>
        </ButtonWrapper>
        <InfoDialog dialogRef={ref} text="Checking out" />
      </StyledCart>
    )
  }

  return (
    <StyledCart>
      <h2>Cart</h2>
      <EmptyCart>
        <CartEmptyIcon />
        <p>Your cart is empty</p>
        <Button type="button" onClick={() => void navigateToBooks()} $withCart>
          Go Shopping
        </Button>
      </EmptyCart>
    </StyledCart>
  )
}
