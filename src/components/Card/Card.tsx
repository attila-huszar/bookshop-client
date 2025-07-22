import { Link, useNavigate } from 'react-router'
import { StyledCard, Details, Image, Title, Description } from './Card.style'
import { Button, Price } from '@/components'
import { useCart } from '@/hooks'
import { ROUTE } from '@/routes'
import type { Book } from '@/types'
import { CartAddIcon, imagePlaceholder } from '@/assets/svg'

export function Card({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { cartItems, addToCart } = useCart()
  const isBookInCart = cartItems.some((item) => item.id === book.id)

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
            $icon={!isBookInCart && <CartAddIcon />}>
            {isBookInCart ? 'View in Basket' : 'Add to Basket'}
          </Button>
        </Details>
      </Link>
    </StyledCard>
  )
}
