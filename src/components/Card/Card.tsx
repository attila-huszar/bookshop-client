import { Link, useNavigate } from 'react-router-dom'
import { StyledCard, Details, Image, Title, Description } from './Card.styles'
import { Button, Price } from 'components'
import { useCart } from 'hooks'
import { PATH } from 'constants/index'
import { IBook } from 'interfaces'
import imagePlaceholder from 'assets/svg/image_placeholder.svg'

export function Card({ book }: { book: IBook }) {
  const navigate = useNavigate()
  const { cartArray, addToCart } = useCart()
  const isBookInCart = cartArray.some((item) => item.id === book.id)

  const handleCartAction = () => {
    if (isBookInCart) {
      navigate(`/${PATH.cart}`)
    } else {
      addToCart(book as IBook)
    }
  }

  return (
    <StyledCard>
      <Link to={`/${PATH.books}/${book.id}`}>
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
              handleCartAction()
            }}
            $withCartAdd={!isBookInCart}>
            {isBookInCart ? 'View in Basket' : 'Add to Basket'}
          </Button>
        </Details>
      </Link>
    </StyledCard>
  )
}
