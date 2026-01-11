import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes'
import { Button, Price } from '@/components'
import { useCart } from '@/hooks'
import { Book } from '@/types'
import { CartAddIcon, imagePlaceholder } from '@/assets/svg'
import { Description, Details, Image, StyledCard, Title } from './Card.style'

export function Card({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { cartItems, addToCart } = useCart()
  const isBookInCart = cartItems.some((item) => item.id === book.id)

  const handleCartAction = () => {
    if (isBookInCart) {
      void navigate(`/${ROUTE.CART}`)
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
              handleCartAction()
            }}
            $icon={!isBookInCart && <CartAddIcon />}>
            {isBookInCart ? 'View in Basket' : 'Add to Basket'}
          </Button>
        </Details>
      </Link>
    </StyledCard>
  )
}
