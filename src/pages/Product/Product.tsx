import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  bookByIdSelector,
  authorByIdSelector,
  bookErrorSelector,
  authorErrorSelector,
} from '../../store'
import { IAuthor, IBook } from '../../interfaces'
import { Button, Error, Price, Recommended } from '../../components'
import { BOOKS } from '../../routes/pathConstants'
import { useCart } from '../../hooks'

export function Product() {
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const { addToCart } = useCart()

  const book: IBook | undefined = useAppSelector(bookByIdSelector(id!))
  const author: IAuthor | undefined = useAppSelector(
    authorByIdSelector(book?.author as number),
  )
  const bookError = useAppSelector(bookErrorSelector)
  const authorError = useAppSelector(authorErrorSelector)

  useEffect(() => {
    if (!book) {
      dispatch(fetchBookById(id!))
    } else if (!author) {
      dispatch(fetchAuthorById(`${book.author}`))
    }
  }, [book, author, id, dispatch])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return book ? (
    <>
      <StyledProduct>
        <Breadcrumb>
          <Link to={`/${BOOKS}`}>Book Details</Link>
        </Breadcrumb>
        <DetailsSection>
          <ImageWrapper>
            <img src={book.imgUrl} alt={book.title} width="100%" />
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
              onClick={(e) => {
                e.preventDefault()
                addToCart(book)
              }}
              $withCart
              $textSize="lg"
              $padding="lg">
              Add to basket
            </Button>
          </ButtonWrapper>
        </DetailsSection>
      </StyledProduct>

      <Recommended />
    </>
  ) : (
    <Error error={bookError} />
  )
}
