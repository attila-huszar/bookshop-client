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
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../hooks'
import {
  fetchBookById,
  fetchAuthorById,
  bookByIdSelector,
  authorByIdSelector,
} from '../../store'
import { IAuthor, IBook } from '../../interfaces'
import { Button, Error, Price } from '../../components'
import { SerializedError } from '@reduxjs/toolkit'
import cartIcon from '../../assets/svg/cart.svg'

export function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const book: IBook | undefined = useAppSelector(bookByIdSelector(id!))
  const author: IAuthor | undefined = useAppSelector(
    authorByIdSelector(book?.author as number),
  )

  useEffect(() => {
    if (book) {
      dispatch(fetchAuthorById(`${book.author}`))
    } else {
      dispatch(fetchBookById(id!)).then((res) => {
        res.payload.author && dispatch(fetchAuthorById(`${res.payload.author}`))
      })
    }
  }, [book, dispatch, id])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    hasPreviousPage ? navigate(-1) : navigate('/')
  }

  return book?.id ? (
    <StyledProduct>
      <Breadcrumb onClick={handleGoBack}>Book Details</Breadcrumb>
      <DetailsSection>
        <ImageWrapper>
          <img src={book.imgUrl} alt={book.title} width="100%" />
        </ImageWrapper>
        <Title>{book.title}</Title>
        <Author>{author?.name}</Author>
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
    <Error error={book as SerializedError} />
  )
}
