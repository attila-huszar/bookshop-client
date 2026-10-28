import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { booksApi } from '@/store/api/booksApi'
import { Button } from '@/components/Button'
import { Price } from '@/components/Price'
import { useCart } from '@/hooks/useCart'
import { CacheTime } from '@/constants/cacheTimes'
import { Book } from '@/types'
import { CartAddIcon, imagePlaceholder } from '@/assets/svg'
import { Description, Details, Image, StyledCard, Title } from './Card.style'

export function Card({ book }: { book: Book }) {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const prefetchBook = booksApi.usePrefetch('book', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
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
      <Link
        to={`/${ROUTE.BOOK}?id=${book.id}`}
        onMouseEnter={() => prefetchBook(book.id)}
        onFocus={() => prefetchBook(book.id)}>
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
            {isBookInCart
              ? t('catalogue.viewBasket')
              : t('catalogue.addToBasket')}
          </Button>
        </Details>
      </Link>
    </StyledCard>
  )
}
