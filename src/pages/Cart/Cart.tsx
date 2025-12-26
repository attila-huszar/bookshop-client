import { Fragment, ChangeEvent, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-hot-toast'
import {
  useAppDispatch,
  useAppSelector,
  useCart,
  useLocalStorage,
} from '@/hooks'
import {
  cartClear,
  cartSelector,
  orderClear,
  orderCreate,
  orderSelector,
} from '@/store'
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
import { Button, IconButton, Loading, Price } from '@/components'
import { InfoDialog } from '@/components/InfoDialog/InfoDialog'
import { ROUTE } from '@/routes'
import { enforceMinMax, calcSubtotalOrDiscount } from '@/helpers'
import type { Cart } from '@/types'
import {
  MinusIcon,
  PlusIcon,
  BinIcon,
  CartEmptyIcon,
  imagePlaceholder,
  CartIcon,
  SpinnerIcon,
} from '@/assets/svg'

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
  const { order, orderIsLoading, orderCreateError } =
    useAppSelector(orderSelector)
  const { getFromLocalStorage } = useLocalStorage()
  const dispatch = useAppDispatch()
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const clientSecret =
      order?.clientSecret ?? getFromLocalStorage<string>('clientSecret')

    if (clientSecret) {
      void navigate(`/${ROUTE.CHECKOUT}`, { replace: true })
    }
  }, [order?.clientSecret, navigate, getFromLocalStorage])

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

  const subtotal = calcSubtotalOrDiscount(cartItems, 'subtotal')
  const discount = calcSubtotalOrDiscount(cartItems, 'discount')

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
    if (cartItems.length && !orderIsLoading) {
      const orderRequest = {
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
      }

      void dispatch(orderCreate(orderRequest))
    }
  }

  const handleCartClear = () => {
    dispatch(cartClear())
    dispatch(orderClear())
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
          <p>Books in basket</p>
          <LabelQuantity>Quantity</LabelQuantity>
          <LabelPrice>Price</LabelPrice>
          <LabelPrice>Total</LabelPrice>
          {cartItems.map((item: Cart) => (
            <Fragment key={item.id}>
              <Book>
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
            onClick={navigateToBooks}
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
            $color="var(--mid-grey)"
            $outline
          />
          <Button
            onClick={handleCheckout}
            disabled={orderIsLoading}
            $icon={orderIsLoading ? <SpinnerIcon /> : <CartIcon />}
            $size="lg"
            $textSize="lg"
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
