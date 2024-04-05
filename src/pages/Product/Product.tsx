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
import { fetchBook } from '../../store/booksSlice'
import { bookSelector } from '../../store/selectors'
import { AppDispatch } from '../../store/store'
import { IBook } from '../../interfaces'
import { Button, Error } from '../../components'
import { SerializedError } from '@reduxjs/toolkit'
import { Strikethrough } from '../../styles/Shared.styles'
import cartIcon from '../../assets/svg/cart.svg'

export function Product() {
  const { id } = useParams()
  const bookFromStore = useSelector(bookSelector(id))
  const dispatch = useDispatch<AppDispatch>()
  const [bookFromFetch, setBookFromFetch] = useState<IBook | null>(null)
  const navigate = useNavigate()

  const book = {
    id: bookFromStore?.id || bookFromFetch?.id,
    title: bookFromStore?.title || bookFromFetch?.title,
    author: bookFromStore?.author || bookFromFetch?.author,
    description: bookFromStore?.description || bookFromFetch?.description,
    price: bookFromStore?.price || bookFromFetch?.price,
    discount: bookFromStore?.discount || bookFromFetch?.discount,
    imgUrl: bookFromStore?.imgUrl || bookFromFetch?.imgUrl,
  }

  useEffect(() => {
    if (!bookFromStore && id) {
      const fetchData = async () => {
        const book = await dispatch(fetchBook(id))
        setBookFromFetch(book.payload)
      }
      fetchData()
    }
  }, [bookFromStore, dispatch, id])

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
        <Author>{book.author}</Author>
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
