import { Link, useNavigate } from 'react-router-dom'
import { StyledCard, Details, Image, Title, Description } from './Card.styles'
import { Button, Price } from '../../components'
import { BOOKS, CART } from '../../routes/pathConstants'
import { IBook } from '../../interfaces'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'
import { useAppSelector, useCart } from '../../hooks'
import { cartSelector } from '../../store'

export function Card({ book }: { book: IBook }) {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const cart = useAppSelector(cartSelector)
  const isBookInCart = cart.some((item) => item.id === book.id)

  return (
    <Link to={`/${BOOKS}/${book.id}`}>
      <StyledCard>
        <Image
          src={book.imgUrl}
          onError={(e) =>
            ((e.target as HTMLImageElement).src = imagePlaceholder)
          }
          alt={book.title}></Image>
        <Details>
          <Title>{book.title}</Title>
          <Description>{book.description}</Description>
          <Price component="card" price={book.price} discount={book.discount} />
          <Button
            onClick={(e) => {
              e.preventDefault()
              isBookInCart ? navigate(`/${CART}`) : addToCart(book)
            }}
            $withCart={!isBookInCart}>
            {isBookInCart ? 'View in Basket' : 'Add to Basket'}
          </Button>
        </Details>
      </StyledCard>
    </Link>
  )
}
