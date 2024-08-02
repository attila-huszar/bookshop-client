import { useEffect, Fragment, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector, useCart } from 'hooks'
import { cartSelector, createOrder, orderSelector } from 'store'
import { Button, IconButton, Loading, Price } from 'components'
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
} from './Cart.styles'
import { PATH } from 'lib'
import { enforceMinMax, calcSubtotalOrDiscount } from 'helpers'
import { ICart, ICreateOrder } from 'interfaces'
import AddQuantityIcon from 'assets/svg/plus.svg?react'
import RemoveQuantityIcon from 'assets/svg/minus.svg?react'
import RemoveFromCartIcon from 'assets/svg/bin.svg?react'
import CartEmptyIcon from 'assets/svg/cart_empty.svg?react'
import imagePlaceholder from 'assets/svg/image_placeholder.svg'
import toast from 'react-hot-toast'

const calculateTotalAmount = (cartArray: ICart[]): number => {
  return cartArray.reduce(
    (total, item) =>
      total + (item.price - (item.price * item.discount) / 100) * item.quantity,
    0,
  )
}

const createPaymentData = (
  amount: number,
  currency: string,
): ICreateOrder['orderToStripe'] => {
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
  const { orderStatus, orderIsLoading, orderError } =
    useAppSelector(orderSelector)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (orderStatus.clientSecret) {
      navigate(`/${PATH.checkout}`)
    } else if (orderError) {
      toast.error(orderError as string, {
        id: 'order-error',
      })
    }
  }, [navigate, orderError, orderStatus.clientSecret])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const subtotal = calcSubtotalOrDiscount(cartArray, 'subtotal')
  const discount = calcSubtotalOrDiscount(cartArray, 'discount')

  const handleRemoveQuantity = (item: ICart) => {
    if (item.quantity > 0) {
      removeQuantity(item)
    }
  }

  const handleAddQuantity = (item: ICart) => {
    if (item.quantity < 50) {
      addQuantity(item)
    }
  }

  const handleSetQuantity = (
    cartItem: ICart,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const newQuantity = enforceMinMax(event.target)
    setQuantity({ cartItem, newQuantity })
  }

  const handleCheckout = () => {
    if (cartArray.length) {
      const total = calculateTotalAmount(cartArray)
      const currency = 'usd'
      const orderToStripe = createPaymentData(total, currency)

      const orderToServer: ICreateOrder['orderToServer'] = {
        paymentId: '',
        orderStatus: 'pending',
        orderTotal: Number(total.toFixed(2)),
        orderCurrency: currency,
        orderItems: cartArray,
        orderCreatedAt: new Date(),
      }

      dispatch(createOrder({ orderToStripe, orderToServer }))
    }
  }

  if (cartIsLoading) {
    return <Loading text="Loading cart..." />
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
          {cartArray.map((item: ICart) => (
            <Fragment key={item.id}>
              <Book>
                <Link to={`/${PATH.books}/${item.id}`}>
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
                  icon={<RemoveQuantityIcon />}
                  title="Remove quantity"
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
                  icon={<AddQuantityIcon />}
                  title="Add quantity"
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
                  price={item.quantity * Number(item.price)}
                  discount={item.discount}
                />
              </PriceTotal>
              <RemoveItem>
                <IconButton
                  onClick={() => removeFromCart(item)}
                  icon={<RemoveFromCartIcon />}
                  title="Remove from cart"
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
            <p>$ {(Number(subtotal) - Number(discount)).toFixed(2)}</p>
          </div>
        </TotalPrice>
        <ButtonWrapper>
          <Button
            onClick={() => navigate(`/${PATH.books}`)}
            disabled={orderIsLoading}
            $size="lg"
            $textSize="lg"
            $inverted>
            Continue Shopping
          </Button>
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
      </StyledCart>
    )
  }

  return (
    <StyledCart>
      <h2>Cart</h2>
      <EmptyCart>
        <CartEmptyIcon />
        <p>Your cart is empty</p>
        <Button
          type="button"
          onClick={() => navigate(`/${PATH.books}`)}
          $withCart>
          Go Shopping
        </Button>
      </EmptyCart>
    </StyledCart>
  )
}
