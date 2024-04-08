import { useNavigate, useParams } from 'react-router-dom'
import {
  StyledProduct,
  Breadcrumb,
  DetailsSection,
  ImageWrapper,
  Description,
  Price,
  Title,
  Author,
  ButtonWrapper,
} from './Product.styles'
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchBookById } from '../../store/booksSlice'
import { fetchAuthorById } from '../../store/authorsSlice'
import { bookByIdSelector, authorByIdSelector } from '../../store/selectors'
import { AppDispatch } from '../../store/store'
import { IAuthor, IBook } from '../../interfaces'
import { Button, Error } from '../../components'
import { SerializedError } from '@reduxjs/toolkit'
import { Strikethrough } from '../../styles/Shared.styles'
import cartIcon from '../../assets/svg/cart.svg'

export function Product() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  const bookFromStore = useSelector(bookByIdSelector(id))
  const [bookFromFetch, setBookFromFetch] = useState<IBook | null>(null)
  const book = { ...(bookFromStore || bookFromFetch) }

  const authorFromStore = useSelector(authorByIdSelector(book.author))
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
  }, [bookFromStore, dispatch, id])

  useEffect(() => {
    if (!authorFromStore && book.author) {
      const fetchData = async () => {
        const author = await dispatch(fetchAuthorById(book.author as number))
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
        <Price>
          {book.discount ? (
            <>
              <span>$ </span>
              <span>
                {(
                  Number(book.price) -
                  (Number(book.price) * book.discount) / 100
                ).toFixed(2)}
              </span>
              <Strikethrough>
                <span>$ </span>
                <span>{book.price}</span>
              </Strikethrough>
            </>
          ) : (
            <>
              <span>$ </span>
              <span>{book.price}</span>
            </>
          )}
        </Price>
        <Description>
          <h2>Summary</h2>
          <p>{book.description}</p>
        </Description>
        <ButtonWrapper>
          <Button onClick={() => {}} textSize="lg" pad="lg">
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
