import { Link } from 'react-router-dom'
import { StyledCard, Details, Image, Title, Description } from './Card.styles'
import { Button, Price } from '../../components'
import { BOOKS } from '../../routes/pathConstants'
import { IBook } from '../../interfaces/'
import imagePlaceholder from '../../assets/svg/image_placeholder.svg'
import { useCart } from '../../hooks'

export function Card({ book }: { book: IBook }) {
  const { addToCart } = useCart()

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
              addToCart(book)
            }}
            $withCart>
            Add to basket
          </Button>
        </Details>
      </StyledCard>
    </Link>
  )
}
