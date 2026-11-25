import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ROUTE } from '@/routes/route'
import { booksApi } from '@/store/api/booksApi'
import { cartAdd } from '@/store/slices/cart'
import { Button } from '@/components/Button'
import { Price } from '@/components/Price'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback'
import { CacheTime, uiTiming } from '@/constants/time'
import type { Book } from '@/types'
import { CartAddIcon, imagePlaceholder } from '@/assets/svg'
import { Description, Details, Image, StyledCard, Title } from './Card.style'

type Props = {
  book: Book
  imageLoading?: HTMLImageElement['loading']
}

export function Card({ book, imageLoading }: Props) {
  const { t } = useTranslation()

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const prefetchBook = booksApi.usePrefetch('book', {
    ifOlderThan: CacheTime.FiveMinutes,
  })
  const prefetchOnHover = useDebouncedCallback(
    prefetchBook,
    uiTiming.prefetchDelayMs,
  )
  const isBookInCart = useAppSelector((state) =>
    state.cart.cartItems.some((item) => item.id === book.id),
  )

  const handleCartAction = () => {
    if (isBookInCart) {
      void navigate(`/${ROUTE.CART}`)
    } else {
      dispatch(cartAdd({ id: book.id }))
    }
  }

  return (
    <StyledCard>
      <Image
        loading={imageLoading}
        src={book.imgUrl}
        onError={(event) => (event.currentTarget.src = imagePlaceholder)}
        alt=""
      />
      <Details>
        <Title
          to={`/${ROUTE.BOOK}?id=${book.id}`}
          onMouseEnter={() => prefetchOnHover(book.id)}
          onMouseLeave={prefetchOnHover.cancel}
          onFocus={() => prefetchBook(book.id)}>
          {book.title}
        </Title>
        <Description>{book.description}</Description>
        <Price component="card" price={book.price} discount={book.discount} />
        <Button
          type="button"
          onClick={handleCartAction}
          $icon={!isBookInCart && <CartAddIcon aria-hidden="true" />}>
          {isBookInCart
            ? t('catalogue.viewBasket')
            : t('catalogue.addToBasket')}
        </Button>
      </Details>
    </StyledCard>
  )
}
