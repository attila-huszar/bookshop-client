import { useEffect, Fragment } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, IconButton, Price } from '../../components'
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
import { BOOKS } from '../../routes/pathConstants'
import AddQuantityIcon from '../../assets/svg/plus.svg?react'
import RemoveQuantityIcon from '../../assets/svg/minus.svg?react'
import RemoveFromCartIcon from '../../assets/svg/xmark.svg?react'
import { enforceMinMax } from '../../utils/enforceInputValues'
import { calcSubtotalOrDiscount } from '../../utils/calcSubtotalOrDiscount'
import { useSelector } from 'react-redux'
import { cartSelector } from '../../store'
import { useCart } from '../../hooks'

export function Cart() {
  const navigate = useNavigate()
  const cart = useSelector(cartSelector)
  const { removeFromCart, addQuantity, removeQuantity, setQuantity } = useCart()

  const subtotal = calcSubtotalOrDiscount(cart, 'subtotal')
  const discount = calcSubtotalOrDiscount(cart, 'discount')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (cart.length) {
    return (
      <StyledCart>
        <h2>Cart</h2>
        <CartGrid>
          <p>Books in basket</p>
          <LabelQuantity>Quantity</LabelQuantity>
          <LabelPrice>Price</LabelPrice>
          <LabelPrice>Total</LabelPrice>
          <div></div>
          {cart.map((item) => (
            <Fragment key={item.id}>
              <Book>
                <Link to={`/${BOOKS}/${item.id}`}>
                  <ImageWrapper>
                    <img src={item.imgUrl} alt={item.title} />
                  </ImageWrapper>
                  <p>{item.title}</p>
                </Link>
              </Book>
              <Quantity>
                <IconButton
                  onClick={() => {
                    if (item.quantity > 0) {
                      removeQuantity(item)
                    }
                  }}
                  icon={<RemoveQuantityIcon />}
                  title="Remove quantity"
                  $iconSize="sm"
                  $color="var(--grey)"
                  disabled={item.quantity === 1}
                />
                <input
                  value={item.quantity}
                  onChange={(e) => {
                    const value = enforceMinMax(e.target)
                    setQuantity({ item, value })
                  }}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={50}
                />
                <IconButton
                  onClick={() => {
                    if (item.quantity < 50) {
                      addQuantity(item)
                    }
                  }}
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
                  onClick={() => {
                    removeFromCart(item)
                  }}
                  icon={<RemoveFromCartIcon />}
                  title="Remove from cart"
                  $color="var(--orange)"
                />
              </RemoveItem>
            </Fragment>
          ))}
        </CartGrid>
        <TotalPrice>
          <h3>Price Summary</h3>
          {!!discount && (
            <>
              <h4>Subtotal: $ {subtotal}</h4>
              <h4>Discount: $ -{discount}</h4>
            </>
          )}
          <p>Total: $ {subtotal - discount}</p>
        </TotalPrice>
        <ButtonWrapper>
          <Button
            $size="lg"
            $textSize="lg"
            $inverted
            onClick={() => navigate(`/${BOOKS}`)}>
            Continue Shopping
          </Button>
          <Button $size="lg" $textSize="lg" $withCart $shadowed>
            Checkout
          </Button>
        </ButtonWrapper>
      </StyledCart>
    )
  }

  return (
    <StyledCart>
      <h2>Cart</h2>
      <EmptyCart>Your cart is empty</EmptyCart>
    </StyledCart>
  )
}
