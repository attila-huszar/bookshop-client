import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import {
  StyledProduct,
  Breadcrumb,
  DetailsSection,
  ImageWrapper,
  BookTitle,
  BookAuthor,
  Description,
  ButtonWrapper,
} from './Product.style'
import { useAppSelector, useCart } from '@/hooks'
import { booksSelector } from '@/store'
import { Button, Alert, Price, Recommended } from '@/components'
import { ROUTE } from '@/routes'
import type { Book } from '@/types'
import { CaretLeftIcon, CartAddIcon, imagePlaceholder } from '@/assets/svg'

export function Product() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const { cartItems, addToCart } = useCart()

  const { books, booksError } = useAppSelector(booksSelector)

  const book = books.find((book) => book.id === Number(id))
  const isBookInCart = cartItems.some((item) => item.id === book?.id)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCartAction = async (book: Book) => {
    if (isBookInCart) {
      await navigate(`/${ROUTE.CART}`)
    } else {
      addToCart(book)
    }
  }

  const handleGoBack = async () => {
    if (window.history?.length && window.history.length > 2) {
      await navigate(-1)
    } else {
      await navigate('/')
    }
  }

  return (
    <>
      <StyledProduct>
        <Breadcrumb onClick={() => void handleGoBack()} title="Go back">
          <CaretLeftIcon height={18} />
          Book Details
        </Breadcrumb>
        {book ? (
          <DetailsSection>
            <ImageWrapper>
              <img
                src={book.imgUrl}
                alt={book.title}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = imagePlaceholder)
                }
                width="100%"
              />
            </ImageWrapper>
            <BookTitle>{book.title}</BookTitle>
            <BookAuthor>{book.author ?? 'Unknown Author'}</BookAuthor>
            <Price
              component="product"
              price={book.price}
              discount={book.discount}
            />
            <Description>
              <h2>Summary</h2>
              <p>{book.description}</p>
            </Description>
            <ButtonWrapper>
              <Button
                onClick={() => void handleCartAction(book)}
                $icon={!isBookInCart && <CartAddIcon />}
                $size="lg"
                $textSize="lg">
                {isBookInCart ? 'View in Basket' : 'Add to Basket'}
              </Button>
            </ButtonWrapper>
          </DetailsSection>
        ) : (
          booksError && <Alert message="Book not found" backButton />
        )}
      </StyledProduct>
      <Recommended />
    </>
  )
}
