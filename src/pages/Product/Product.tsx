import { memo, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
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
import CaretIcon from '@/assets/svg/caret_left.svg?react'
import imagePlaceholder from '@/assets/svg/image_placeholder.svg'

export function Product() {
  const { id } = useParams()
  const { cartArray, addToCart } = useCart()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const book: Book | undefined = useAppSelector(bookByIdSelector(id!))
  const author: Author | undefined = useAppSelector(
    authorByIdSelector(typeof book?.author === 'number' ? book.author : null),
  )

  const { booksError } = useAppSelector(booksSelector)
  const { authorError } = useAppSelector(authorsSelector)
  const RecommendedMemoized = memo(Recommended)
  const isBookInCart = useMemo(() => {
    return cartArray.some((item) => item.id === book?.id)
  }, [cartArray, book])

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
          <CaretIcon height={18} />
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
                $withCartAdd={!isBookInCart}
                $textSize="lg"
                $size="lg">
                {isBookInCart ? 'View in Basket' : 'Add to Basket'}
              </Button>
            </ButtonWrapper>
          </DetailsSection>
        ) : (
          booksError && <Error text="Not found" error={booksError} />
        )}
      </StyledProduct>
      <RecommendedMemoized />
    </>
  )
}
