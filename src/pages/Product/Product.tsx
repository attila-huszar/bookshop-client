import { useEffect } from 'react'
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
import { Button, Error, Price } from '../../components'
import cartIcon from '../../assets/svg/cart.svg'

export function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

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

  function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    hasPreviousPage ? navigate(-1) : navigate('/')
  }

  return book ? (
    <StyledProduct>
      <Breadcrumb onClick={handleGoBack}>Book Details</Breadcrumb>
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
          <Button onClick={() => {}} $textSize="lg" $pad="lg">
            <img src={cartIcon} />
            Add to basket
          </Button>
        </ButtonWrapper>
      </DetailsSection>
    </StyledProduct>
  ) : (
    <Error error={bookError} />
  )
}
