import { Link, useNavigate } from 'react-router-dom'
import { Button, IconButton, Price } from '../../components'
import {
  StyledCart,
  CartItem,
  Quantity,
  TotalPrice,
  ButtonWrapper,
} from './Cart.styles'
import { BOOKS } from '../../routes/pathConstants'
import AddQuantityIcon from '../../assets/svg/plus.svg?react'
import RemoveQuantityIcon from '../../assets/svg/minus.svg?react'
import RemoveFromCartIcon from '../../assets/svg/xmark.svg?react'

export function Cart() {
  const navigate = useNavigate()

  const totalPrice = Number(
    mockData
      .reduce(
        (acc, item) =>
          acc +
          quantity *
            (Number(item.price) - (Number(item.price) * item.discount) / 100),
        0,
      )
      .toFixed(2),
  )

  const discount = Number(
    mockData
      .reduce(
        (acc, item) =>
          acc + ((Number(item.price) * item.discount) / 100) * quantity,
        0,
      )
      .toFixed(2),
  )

  return (
    <StyledCart>
      <h2>Cart</h2>
      <div>
        {mockData.map((item) => (
          <CartItem key={item.id}>
            <Link to={`/${BOOKS}/${item.id}`}>
              <img src={item.imgUrl} alt={item.title} />
            </Link>
            <Link to={`/${BOOKS}/${item.id}`}>{item.title}</Link>
            <IconButton
              onClick={() => {}}
              icon={<RemoveQuantityIcon />}
              title="Remove quantity"
              $iconSize="sm"
              $color="var(--grey)"
            />
            <Quantity value={quantity} onChange={() => {}}></Quantity>
            <IconButton
              onClick={() => {}}
              icon={<AddQuantityIcon />}
              title="Add quantity"
              $iconSize="sm"
              $color="var(--grey)"
            />
            <Price
              component="cart"
              price={item.price}
              discount={item.discount}
            />
            <Price
              component="cart"
              price={quantity * Number(item.price)}
              discount={item.discount}
            />
            <IconButton
              onClick={() => {}}
              icon={<RemoveFromCartIcon />}
              title="Remove from cart"
              $color="var(--orange)"
            />
          </CartItem>
        ))}
      </div>
      <TotalPrice>
        <h3>Price Summary</h3>
        {discount && (
          <>
            <h4>Subtotal: $ {totalPrice + discount}</h4>
            <h4>Discount: $ -{discount}</h4>
          </>
        )}
        <p>Total: $ {totalPrice}</p>
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

const mockData = [
  {
    id: 1,
    title: 'Great Expectations',
    author: 1,
    genre: 'Novel',
    imgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Greatexpectations_vol1.jpg/300px-Greatexpectations_vol1.jpg',
    description:
      'The story of Pip, an orphan who rises from humble beginnings to gentleman status, and his love for the cold-hearted Estella.',
    yearOfPublishing: '1861',
    price: '23',
    rating: 4.6,
    discount: 0,
    topSellers: true,
    new: false,
  },
  {
    id: 2,
    title: 'To Kill a Mockingbird',
    author: 2,
    genre: 'Novel',
    imgUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg/330px-To_Kill_a_Mockingbird_%28first_edition_cover%29.jpg',
    favorite: true,
    description:
      "The story of Scout Finch's childhood in Alabama, her father Atticus Finch, and the trial of a black man accused of raping a white woman.",
    yearOfPublishing: '1960',
    price: '25',
    rating: 4.8,
    discount: 10,
    new: false,
  },
]

const quantity = 2
