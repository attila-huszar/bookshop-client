import { Link, useNavigate } from 'react-router-dom'
import { StyledCard, Details, Image, Title, Description } from './Card.styles'
import { Button, Price } from '../../components'
import { useCart } from '../../hooks'
import { BOOKS, CART } from '../../routes/pathConstants'
import { IBook } from '../../interfaces'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'

export function Card({ book }: { book: IBook }) {
  const navigate = useNavigate()
  const { cartData, addToCart } = useCart()
  const isBookInCart = cartData.some((item) => item.id === book.id)

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
