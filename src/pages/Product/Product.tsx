import { memo, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCart } from '../../hooks'
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
import { useAppSelector, useAppDispatch } from '../../hooks'
import {
  fetchBookById,
  fetchAuthorById,
  booksSelector,
  bookByIdSelector,
  authorsSelector,
  authorByIdSelector,
} from '../../store'
import { IAuthor, IBook } from '../../interfaces'
import { Button, Error, Price, Recommended } from '../../components'
import { CART } from '../../routes/pathConstants'

export function Product() {
  const { id } = useParams()
  const { cartData, addToCart } = useCart()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const book: IBook | undefined = useAppSelector(bookByIdSelector(id!))
  const author: IAuthor | undefined = useAppSelector(
    authorByIdSelector(book?.author as number),
  )
  const { booksError } = useAppSelector(booksSelector)
  const { authorsError } = useAppSelector(authorsSelector)
  const RecommendedMemoized = memo(Recommended)
  const isBookInCart = useMemo(() => {
    return cartData.some((item) => item.id === book?.id)
  }, [cartData, book])

  useEffect(() => {
    if (!book && id) {
      dispatch(fetchBookById(id))
    } else if (!author && book) {
      dispatch(fetchAuthorById(`${book.author}`))
    }
  }, [author, book, dispatch, id])

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
            <img src={book.imgUrl} alt={book.title} width="100%" />
          </ImageWrapper>
          <Title>{book.title}</Title>
          <Author>{author ? author.name : (authorsError as string)}</Author>
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
                isBookInCart ? navigate(`/${CART}`) : addToCart(book)
              }}
              $withCart={!isBookInCart}
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
