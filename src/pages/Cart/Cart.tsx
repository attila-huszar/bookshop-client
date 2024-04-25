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
import { calcSubtotalOrDiscount } from '../../utils/calcSubtotalOrDiscount'
import { useSelector } from 'react-redux'
import { cartSelector } from '../../store'
import { useCart } from '../../hooks'

export function Cart() {
  const navigate = useNavigate()
  const cart = useSelector(cartSelector)
  const { removeFromCart } = useCart()

  const subTotal = calcSubtotalOrDiscount(cart, quantity, 'subtotal')
  const discount = calcSubtotalOrDiscount(cart, quantity, 'discount')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!cart.length) {
    return (
      <StyledCart>
        <h2>Cart</h2>
        <EmptyCart>Your cart is empty</EmptyCart>
      </StyledCart>
    )
  }
  return (
    <StyledCart>
      <h2>Cart</h2>
      <CartGrid>
        <p>Books in basket</p>
        <LabelQuantity>Quantity</LabelQuantity>
        <LabelPrice>Price</LabelPrice>
        <LabelPrice>Total</LabelPrice>
        <div></div>
        {cart.map((book) => (
          <Fragment key={book.id}>
            <Book>
              <Link to={`/${BOOKS}/${book.id}`}>
                <ImageWrapper>
                  <img src={book.imgUrl} alt={book.title} />
                </ImageWrapper>
                <p>{book.title}</p>
              </Link>
            </Book>
            <Quantity>
              <IconButton
                onClick={() => {}}
                icon={<RemoveQuantityIcon />}
                title="Remove quantity"
                $iconSize="sm"
                $color="var(--grey)"
              />
              <input value={quantity} onChange={() => {}} />
              <IconButton
                onClick={() => {}}
                icon={<AddQuantityIcon />}
                title="Add quantity"
                $iconSize="sm"
                $color="var(--grey)"
              />
            </Quantity>
            <PriceItem>
              <Price
                component="cart"
                price={book.price}
                discount={book.discount}
              />
            </PriceItem>
            <PriceTotal>
              <Price
                component="cart"
                price={quantity * Number(book.price)}
                discount={book.discount}
              />
            </PriceTotal>
            <RemoveItem>
              <IconButton
                onClick={(e) => {
                  e.preventDefault()
                  removeFromCart(book)
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
            <h4>Subtotal: $ {subTotal}</h4>
            <h4>Discount: $ -{discount}</h4>
          </>
        )}
        <p>Total: $ {subTotal - discount}</p>
      </TotalPrice>
      <ButtonWrapper>
        <Button
          $padding="lg"
          $textSize="lg"
          $inverted
          onClick={() => navigate(`/${BOOKS}`)}>
          Continue Shopping
        </Button>
        <Button $padding="lg" $textSize="lg" $withCart $shadowed>
          Checkout
        </Button>
      </ButtonWrapper>
    </StyledCart>
  )
}

const quantity = 2
