import { Link, useNavigate } from 'react-router'
import { StyledCard, Details, Image, Title, Description } from './Card.style'
import { Button, Price } from '@/components'
import { useCart } from '@/hooks'
import { ROUTE } from '@/routes'
import type { Book } from '@/types'
import imagePlaceholder from '@/assets/svg/image_placeholder.svg'

export function Card({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { cartArray, addToCart } = useCart()
  const isBookInCart = cartArray.some((item) => item.id === book.id)

  const handleCartAction = async () => {
    if (isBookInCart) {
      await navigate(`/${ROUTE.CART}`)
    } else {
      addToCart(book)
    }
  }

  return (
    <StyledCard>
      <Link to={`/${ROUTE.BOOK}?id=${book.id}`}>
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
              void handleCartAction()
            }}
            $withCartAdd={!isBookInCart}>
            {isBookInCart ? 'View in Basket' : 'Add to Basket'}
          </Button>
        </Details>
      </Link>
    </StyledCard>
  )
}
