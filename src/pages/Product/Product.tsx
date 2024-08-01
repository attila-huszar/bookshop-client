import { memo, useEffect, useMemo } from 'react'
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
} from './Product.styles'
import { useAppSelector, useAppDispatch, useCart } from 'hooks'
import {
  fetchBookById,
  booksSelector,
  bookByIdSelector,
  authorsSelector,
  authorByIdSelector,
} from 'store'
import { Button, Error, Price, Recommended } from 'components'
import { PATH } from 'lib'
import { IAuthor, IBook } from 'interfaces'
import imagePlaceholder from 'assets/svg/image_placeholder.svg'

export function Product() {
  const { id } = useParams()
  const { cartArray, addToCart } = useCart()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const book: IBook | undefined = useAppSelector(bookByIdSelector(id!))
  const author: IAuthor | undefined = useAppSelector(
    authorByIdSelector(book?.author as number),
  )
  const { booksError } = useAppSelector(booksSelector)
  const { authorError } = useAppSelector(authorsSelector)
  const RecommendedMemoized = memo(Recommended)
  const isBookInCart = useMemo(() => {
    return cartArray.some((item) => item.id === book?.id)
  }, [cartArray, book])

  useEffect(() => {
    if (!book && id) {
      dispatch(fetchBookById(Number(id)))
    }
  }, [book, dispatch, id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleGoBack = () => {
    if (window.history?.length && window.history.length > 2) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return book ? (
    <>
      <StyledProduct>
        <Breadcrumb>
          <button onClick={handleGoBack} type="button">
            Book Details
          </button>
        </Breadcrumb>
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
          <Author>{author ? author.name : (authorError as string)}</Author>
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
              onClick={() => {
                isBookInCart ? navigate(`/${PATH.cart}`) : addToCart(book)
              }}
              $withCartAdd={!isBookInCart}
              $textSize="lg"
              $size="lg">
              {isBookInCart ? 'View in Basket' : 'Add to Basket'}
            </Button>
          </ButtonWrapper>
        </DetailsSection>
      </StyledProduct>
      <RecommendedMemoized />
    </>
  ) : (
    <Error error={booksError} />
  )
}
