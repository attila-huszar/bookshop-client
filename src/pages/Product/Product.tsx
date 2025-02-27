import { memo, useEffect, useLayoutEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  StyledProduct,
  Breadcrumb,
  DetailsSection,
  ImageWrapper,
  Description,
  Title,
  Author,
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
import { PATH } from '@/constants'
import { IAuthor, IBook } from '@/interfaces'
import imagePlaceholder from '@/assets/svg/image_placeholder.svg'

export function Product() {
  const { id } = useParams()
  const { cartArray, addToCart } = useCart()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const book: IBook | undefined = useAppSelector(bookByIdSelector(id!))
  const author: IAuthor | undefined = useAppSelector(
    authorByIdSelector(book?.author ?? null),
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

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleCartAction = (book: IBook) => {
    if (isBookInCart) {
      navigate(`/${PATH.cart}`)
    } else {
      addToCart(book)
    }
  }

  const handleGoBack = () => {
    if (window.history?.length && window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <StyledProduct>
        <Breadcrumb>
          <button onClick={handleGoBack} type="button">
            Book Details
          </button>
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
            <Title>{book.title}</Title>
            <Author>{author ? author.name : authorError}</Author>
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
                onClick={() => handleCartAction(book)}
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
