import { Fragment } from 'react/jsx-runtime'
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
} from './Cart.styles'
import { BOOKS } from '../../routes/pathConstants'
import AddQuantityIcon from '../../assets/svg/plus.svg?react'
import RemoveQuantityIcon from '../../assets/svg/minus.svg?react'
import RemoveFromCartIcon from '../../assets/svg/xmark.svg?react'
import { calcSubtotalOrDiscount } from '../../utils/calcSubtotalOrDiscount'
import { IBook } from '../../interfaces'

export function Cart() {
  const navigate = useNavigate()

  const subTotal = calcSubtotalOrDiscount(mockData, quantity, 'subtotal')
  const discount = calcSubtotalOrDiscount(mockData, quantity, 'discount')

  return (
    <StyledCart>
      <h2>Cart</h2>
      <CartGrid>
        <p>Books in basket</p>
        <LabelQuantity>Quantity</LabelQuantity>
        <LabelPrice>Price</LabelPrice>
        <LabelPrice>Total</LabelPrice>
        <div></div>
        {mockData.map((item) => (
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
                price={item.price}
                discount={item.discount}
              />
            </PriceItem>
            <PriceTotal>
              <Price
                component="cart"
                price={quantity * Number(item.price)}
                discount={item.discount}
              />
            </PriceTotal>
            <RemoveItem>
              <IconButton
                onClick={() => {}}
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

const mockData: IBook[] = [
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
    discount: 10,
    topSellers: true,
    new: false,
    favorite: false,
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
    discount: 0,
    new: false,
  },
]

const quantity = 2
