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
import { useEffect, useState } from 'react'
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

  const bookFromStore = useAppSelector(bookByIdSelector(id))
  const [bookFromFetch, setBookFromFetch] = useState<IBook | null>(null)
  const book = { ...(bookFromStore || bookFromFetch) }

  const authorFromStore = useAppSelector(authorByIdSelector(book.author))
  const [authorFromFetch, setAuthorFromFetch] = useState<IAuthor | null>(null)
  const author = { ...(authorFromStore || authorFromFetch) }

  useEffect(() => {
    if (!bookFromStore && id) {
      const fetchData = async () => {
        const book = await dispatch(fetchBookById(id))
        setBookFromFetch(book.payload)
      }
      fetchData()
    }
  }, [bookFromStore, id, dispatch])

  useEffect(() => {
    if (!authorFromStore && book.author) {
      const fetchData = async () => {
        const author = await dispatch(fetchAuthorById(`${book.author}`))
        setAuthorFromFetch(author.payload)
      }
      fetchData()
    }
  }, [authorFromStore, book.author, dispatch])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  function handleGoBack() {
    const hasPreviousPage = window.history.length > 2
    hasPreviousPage ? navigate(-1) : navigate('/')
  }

  return book.id ? (
    <StyledProduct>
      <Breadcrumb onClick={handleGoBack}>Book Details</Breadcrumb>
      <DetailsSection>
        <ImageWrapper>
          <img src={book.imgUrl} alt={book.title} width="100%" />
        </ImageWrapper>
        <Title>{book.title} </Title>
        <Author>{author.name}</Author>
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
    <Error error={bookFromFetch as SerializedError} />
  )
}
