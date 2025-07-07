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
import { useAppSelector, useAppDispatch, useCart } from '@/hooks'
import {
  fetchBookById,
  booksSelector,
  bookByIdSelector,
  authorsSelector,
  authorByIdSelector,
} from '@/store'
import { Button, Error, Price, Recommended } from '@/components'
import { ROUTE } from '@/routes'
import type { Author, Book } from '@/types'
import { CaretLeftIcon, CartAddIcon, imagePlaceholder } from '@/assets/svg'

export function Product() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const { cartArray, addToCart } = useCart()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const book: Book | null = useAppSelector(bookByIdSelector(id))
  const author: Author | null = useAppSelector(authorByIdSelector(book?.author))

  const { booksError } = useAppSelector(booksSelector)
  const { authorError } = useAppSelector(authorsSelector)

  const isBookInCart = cartArray.some((item) => item.id === book?.id)

  useEffect(() => {
    if (!book && id) {
      void dispatch(fetchBookById(Number(id)))
    }
  }, [book, dispatch, id])

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
            <BookAuthor>
              {typeof book.author === 'string'
                ? book.author
                : author
                  ? author.name
                  : authorError}
            </BookAuthor>
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
          booksError && <Error text="Book not found" backButton />
        )}
      </StyledProduct>
      <Recommended />
    </>
  )
}
