import { useEffect, Fragment, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppSelector, useCart } from '../../hooks'
import { cartLoadingSelector } from '../../store'
import { Button, IconButton, Loading, Price } from '../../components'
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
import { enforceMinMax } from '../../utils/enforceMinMax'
import { calcSubtotalOrDiscount } from '../../utils/calcSubtotalOrDiscount'
import { ICart } from '../../interfaces'
import AddQuantityIcon from '../../assets/svg/plus.svg?react'
import RemoveQuantityIcon from '../../assets/svg/minus.svg?react'
import RemoveFromCartIcon from '../../assets/svg/xmark.svg?react'

export function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, addQuantity, removeQuantity, setQuantity } =
    useCart()
  const cartIsLoading = useAppSelector(cartLoadingSelector)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const subtotal = calcSubtotalOrDiscount(cart, 'subtotal')
  const discount = calcSubtotalOrDiscount(cart, 'discount')

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
    item: ICart,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const value = enforceMinMax(event.target)
    setQuantity({ item, value })
  }

  if (cartIsLoading) {
    return <Loading />
  }

  if (cart.length) {
    return (
      <StyledCart>
        <h2>Cart</h2>
        <CartGrid>
          <p>Books in basket</p>
          <LabelQuantity>Quantity</LabelQuantity>
          <LabelPrice>Price</LabelPrice>
          <LabelPrice>Total</LabelPrice>
          {cart.map((item: ICart) => (
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
                  onClick={() => handleRemoveQuantity(item)}
                  icon={<RemoveQuantityIcon />}
                  title="Remove quantity"
                  $iconSize="sm"
                  $color="var(--grey)"
                  disabled={item.quantity === 1}
                />
                <input
                  value={item.quantity}
                  onChange={(e) => handleSetQuantity(item, e)}
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
